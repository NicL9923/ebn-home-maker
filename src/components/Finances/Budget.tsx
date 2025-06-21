import { InfoOutlineIcon } from '@chakra-ui/icons';
import {
    Box,
    Card,
    CardBody,
    Grid,
    GridItem,
    Heading,
    IconButton,
    Stack,
    Text,
    Tooltip,
    Wrap,
    WrapItem,
    useToken,
} from '@chakra-ui/react';
import React, { useMemo, useState } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { MdAdd, MdSubdirectoryArrowRight } from 'react-icons/md';
import { Legend, Pie, PieChart, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import Client from '../../Client';
import { BudgetCategory, BudgetContextValue, BudgetSubcategory, IBudget, Transaction } from '../../models/types';
import { useUserStore } from '../../state/UserStore';
import {
    genUuid,
    getAbsDiffAndComparisonOfMonetaryValues,
    getCurrencyString,
    getNiceChartColor,
    moveMonth,
    roundTo2Decimals,
} from '../../utils/utils';
import ConfirmDialog from '../ConfirmDialog';
import AddOrEditTransaction from '../Forms/AddOrEditTransaction';
import EditableLabel from '../Inputs/EditableLabel';
import BudgetCategories from './BudgetComponents/BudgetCategories';

export const BudgetContext = React.createContext({} as BudgetContextValue);

export const budgetRowsGridTemplateColumns = '3fr 1fr 1fr';

interface BudgetProps {
    budget: IBudget;
    setBudget: (newBudget: IBudget) => void;
    curBudgetMonthAndYear: Date;
    setBudgetCurMonthAndYear: (newDate: Date) => void;
}

const Budget = (props: BudgetProps) => {
    const { budget, setBudget, curBudgetMonthAndYear, setBudgetCurMonthAndYear } = props;
    const [red500, green400, yellow300] = useToken('colors', ['red.500', 'green.400', 'yellow.300']);

    const family = useUserStore((state) => state.family);

    const [addingTransaction, setAddingTransaction] = useState(false);
    const [catSubcatKey, setCatSubcatKey] = useState('');
    const [itemToRemove, setItemToRemove] = useState<[string, string | undefined]>(); // [catName, subCatName]

    const saveUpdatedCategories = (categories: BudgetCategory[], transactions?: Transaction[]) => {
        if (!family?.budgetId) return;

        const budgetMergeObj: Partial<IBudget> = {
            categories,
        };

        if (transactions) {
            budgetMergeObj.transactions = transactions;
        }

        Client.updateBudget(family.budgetId, budgetMergeObj);
    };

    const setMonthlyNetIncome = (newValue?: string) => {
        if (!family?.budgetId || !newValue) return;

        Client.updateBudget(family.budgetId, {
            monthlyNetIncome: parseFloat(newValue),
        });
    };

    const setCategoryName = (newValue: string | undefined, oldName: string) => {
        if (!family?.budgetId || !newValue) return;
        if (newValue === oldName) return;

        const updArr = [...budget.categories];
        updArr[updArr.findIndex((cat) => cat.name === oldName)].name = newValue;

        // Update any transactions w/ this cat
        const updTransactions = [...budget.transactions];
        updTransactions.forEach((t) => {
            if (t.category === oldName) {
                t.category = newValue;
            }
        });

        saveUpdatedCategories(updArr, updTransactions);
    };

    const setSubCatProperty = (newValue: string | undefined, oldName: string, catName: string, propName: string) => {
        if (!family?.budgetId || !newValue || newValue === oldName) return;

        const updArr = [...budget.categories];
        const updTransactions = [...budget.transactions];

        updArr.forEach((cat) => {
            if (cat.name === catName) {
                cat.subcategories.forEach((subCat: BudgetSubcategory) => {
                    if (subCat.name === oldName) {
                        if (propName === 'name') {
                            updTransactions.forEach((t) => {
                                if (t.category === catName && t.subcategory === oldName) {
                                    t.subcategory = newValue;
                                }
                            });

                            subCat.name = newValue;
                        } else if (propName === 'allotted') {
                            subCat.totalAllotted = parseFloat(newValue);
                        } else {
                            console.error('Invalid property to set for subcat');
                        }
                    }
                });
            }
        });

        saveUpdatedCategories(updArr, updTransactions);
    };

    const addNewCategory = () => {
        if (!family?.budgetId) return;

        let newCatName = 'New Category';
        let nameIterator = 1;

        while (budget.categories.some((cat: BudgetCategory) => cat.name === newCatName)) {
            newCatName = `New Category${nameIterator}`;
            nameIterator++;
        }

        saveUpdatedCategories([...budget.categories, { uid: genUuid(), name: newCatName, subcategories: [] }]);
    };

    const removeCategory = (catName: string) => {
        if (!family?.budgetId) return;

        const updArr = [...budget.categories];
        const updTransactions = [...budget.transactions];

        updArr.splice(
            updArr.findIndex((cat) => cat.name === catName),
            1
        );

        updTransactions.forEach((t) => {
            if (t.category === catName) {
                t.category = 'N/A';
            }
        });

        saveUpdatedCategories(updArr, updTransactions);
    };

    const addNewSubCategory = (catName: string) => {
        if (!family?.budgetId) return;

        const updArr = [...budget.categories];

        updArr.forEach((cat) => {
            if (cat.name === catName) {
                let newSubCatName = 'New SubCategory';
                let nameIterator = 1;

                while (cat.subcategories.some((subcat: BudgetSubcategory) => subcat.name === newSubCatName)) {
                    newSubCatName = `New SubCategory${nameIterator}`;
                    nameIterator++;
                }

                cat.subcategories.push({
                    uid: genUuid(),
                    name: newSubCatName,
                    currentSpent: 0,
                    totalAllotted: 0,
                });
            }
        });

        saveUpdatedCategories(updArr);
    };

    const removeSubCategory = (catName: string, subCatName: string) => {
        if (!family?.budgetId) return;

        const updArr = [...budget.categories];
        const updTransactions = [...budget.transactions];

        updArr.forEach((cat) => {
            if (cat.name === catName) {
                cat.subcategories.splice(
                    cat.subcategories.findIndex((subcat: BudgetSubcategory) => subcat.name === subCatName),
                    1
                );
            }
        });

        updTransactions.forEach((t) => {
            if (t.category === catName && t.subcategory === subCatName) {
                t.subcategory = 'N/A';
            }
        });

        saveUpdatedCategories(updArr, updTransactions);
    };

    const moveCategory = (dragIdx: number, dropIdx: number) => {
        if (!family?.budgetId) return;

        const updArr = [...budget.categories];
        const cat = updArr[dragIdx];

        updArr.splice(dragIdx, 1);
        updArr.splice(dropIdx, 0, cat);

        const newBudget = { ...budget };
        newBudget.categories = updArr;
        setBudget(newBudget);

        saveUpdatedCategories(updArr);
    };

    const moveSubCategory = (srcCatName: string, destCatName: string, dragIdx: number, dropIdx: number) => {
        // Src & Dest cat is used to handle subcat being moved to a different cat
        if (!family?.budgetId) return;

        const updArr = [...budget.categories];
        const srcCatIdx = updArr.findIndex((cat) => cat.name === srcCatName);
        const destCatIdx = updArr.findIndex((cat) => cat.name === destCatName);
        const subcat = updArr[srcCatIdx].subcategories[dragIdx];

        updArr[srcCatIdx].subcategories.splice(dragIdx, 1);
        updArr[destCatIdx].subcategories.splice(dropIdx, 0, subcat);

        const newBudget = { ...budget };
        newBudget.categories = updArr;
        setBudget(newBudget);

        saveUpdatedCategories(updArr);
    };

    const allottedRemainder = useMemo(() => {
        if (!budget.totalAllotted) return;
        let helperColor: string | undefined = undefined;
        let helperText = 'to allot';

        const [allottedRemainderStatus, differenceString] = getAbsDiffAndComparisonOfMonetaryValues(
            budget.totalAllotted,
            budget.monthlyNetIncome
        );

        if (allottedRemainderStatus === 'under') {
            helperColor = yellow300;
        } else if (allottedRemainderStatus === 'over') {
            helperText = 'over-allotted';
            helperColor = red500;
        }

        return (
            <Text color={helperColor} ml={-3}>
                ${differenceString} {helperText}
            </Text>
        );
    }, [budget.monthlyNetIncome, budget.totalAllotted, red500, yellow300]);

    const spendingRemainder = useMemo(() => {
        if (budget.totalAllotted === undefined || budget.totalSpent === undefined) return;

        let helperColor: string | undefined = undefined;
        let helperText = 'remaining';

        const [spendingRemainderStatus, differenceString] = getAbsDiffAndComparisonOfMonetaryValues(
            budget.totalSpent,
            budget.totalAllotted
        );

        if (spendingRemainderStatus === 'under') {
            helperColor = green400;
        } else if (spendingRemainderStatus === 'over') {
            helperText = 'over-budget';
            helperColor = red500;
        }

        return (
            <Text color={helperColor} ml={-1}>
                ${differenceString} {helperText}
            </Text>
        );
    }, [budget.totalAllotted, budget.totalSpent, green400, red500]);

    const allottedPercentChartData = useMemo(
        () =>
            budget.categories.flatMap((category, idx) => {
                if (category.totalAllotted && budget.totalAllotted) {
                    const percentOfBudget = (category.totalAllotted / budget.totalAllotted) * 100;
                    return [
                        { name: category.name, value: roundTo2Decimals(percentOfBudget), fill: getNiceChartColor(idx) },
                    ];
                }

                return [];
            }),
        []
    );

    if (!family?.budgetId) {
        return null;
    }

    return (
        <Box>
            <Stack direction='row' justifyContent='center' alignItems='center' mb={4} mt={2}>
                {!family.settings.showAllTransactionsOnCurrentMonth && (
                    <IconButton
                        icon={<HiChevronLeft />}
                        aria-label='Previous month'
                        onClick={() => setBudgetCurMonthAndYear(moveMonth(curBudgetMonthAndYear, 'backward'))}
                        fontSize={20}
                        boxSize={6}
                    />
                )}

                <Heading>
                    {curBudgetMonthAndYear.toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                    })}
                </Heading>

                {!family.settings.showAllTransactionsOnCurrentMonth && (
                    <IconButton
                        icon={<HiChevronRight />}
                        aria-label='Next month'
                        onClick={() => setBudgetCurMonthAndYear(moveMonth(curBudgetMonthAndYear, 'forward'))}
                        fontSize={20}
                        boxSize={6}
                    />
                )}
            </Stack>

            <Box mb={4} width={325} mx='auto'>
                <Box sx={{ p: 2 }}>
                    <Stack direction='row' alignContent='center' spacing={2} mb={2}>
                        <Text>Net Income</Text>
                        <EditableLabel
                            fieldName='Monthly net income'
                            fieldType='DecimalNum'
                            textSize='xl'
                            isMonetaryValue
                            text={getCurrencyString(budget.monthlyNetIncome, false)}
                            onSubmitValue={setMonthlyNetIncome}
                        />
                    </Stack>

                    <Stack direction='row' alignContent='center' spacing={2}>
                        <Text>Total Allotted</Text>
                        <Text>{getCurrencyString(budget.totalAllotted ?? 0)}</Text>
                    </Stack>
                    {allottedRemainder}

                    <Stack direction='row' alignContent='center' spacing={2} mt={1}>
                        <Text>Total Spent</Text>
                        <Text>{getCurrencyString(budget.totalSpent ?? 0)}</Text>
                    </Stack>
                    <Stack
                        direction='row'
                        alignContent='center'
                        alignItems='center'
                        justifyContent='center'
                        spacing={1}
                    >
                        {spendingRemainder}
                        <Tooltip label='(of total allotted)'>
                            <InfoOutlineIcon boxSize={3} />
                        </Tooltip>
                    </Stack>
                </Box>
            </Box>

            <Box>
                <Box position='sticky' top='64px' zIndex={10} bgColor='green.400' pt={1} pb={1}>
                    <Grid templateColumns={budgetRowsGridTemplateColumns} alignItems='center' gridColumnGap={1}>
                        <GridItem w='100%'>
                            <Stack direction='row' alignItems='center' spacing={0}>
                                <Tooltip title='Add category'>
                                    <IconButton
                                        icon={<MdAdd />}
                                        onClick={addNewCategory}
                                        variant='ghost'
                                        fontSize={24}
                                        aria-label='Add category'
                                    />
                                </Tooltip>

                                <Stack width='100%' alignItems='start' spacing={0}>
                                    <Text>Category</Text>
                                    <Stack direction='row' alignItems='end' ml={4}>
                                        <MdSubdirectoryArrowRight />
                                        <Text>Sub-category</Text>
                                    </Stack>
                                </Stack>
                            </Stack>
                        </GridItem>

                        <GridItem ml={1} w='100%'>
                            <Text>Allotted</Text>
                        </GridItem>
                        <GridItem w='100%'>
                            <Text>Spent</Text>
                        </GridItem>
                    </Grid>
                </Box>

                <BudgetContext.Provider
                    value={{
                        budget,
                        moveCategory,
                        moveSubCategory,
                        setCategoryName,
                        addNewSubCategory,
                        setSubCatProperty,
                        setItemToRemove,
                        setAddingTransaction,
                        setCatSubcatKey,
                    }}
                >
                    <BudgetCategories />
                </BudgetContext.Provider>
            </Box>

            <Card mt={8}>
                <CardBody>
                    <Wrap align='center' justify='center'>
                        <WrapItem>
                            <div style={{ height: '400px', width: '400px', margin: 4 }}>
                                <Heading size='md' textAlign='center'>
                                    Percent of allotted budget
                                </Heading>

                                <ResponsiveContainer width='85%'>
                                    <PieChart>
                                        <Pie
                                            data={allottedPercentChartData}
                                            dataKey='value'
                                            outerRadius={100}
                                            //innerRadius={60}
                                            label
                                        />
                                        <RechartsTooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </WrapItem>
                    </Wrap>
                </CardBody>
            </Card>

            <AddOrEditTransaction
                isOpen={addingTransaction}
                setIsOpen={setAddingTransaction}
                budget={budget}
                initialCatSubcat={catSubcatKey}
            />

            <ConfirmDialog
                title={`Delete ${itemToRemove && itemToRemove[1] !== undefined ? 'subcategory' : 'category'}`}
                text={`Are you sure you want to delete${
                    itemToRemove && itemToRemove[1] !== undefined ? ` subcategory ${itemToRemove[1]} in` : ''
                } category ${itemToRemove && itemToRemove[0]}?`}
                primaryActionText='Remove'
                isOpen={!!itemToRemove}
                onClose={(confirmed) => {
                    if (confirmed && itemToRemove) {
                        if (itemToRemove[1] === undefined) {
                            removeCategory(itemToRemove[0]);
                        } else {
                            removeSubCategory(itemToRemove[0], itemToRemove[1]);
                        }
                    }

                    setItemToRemove(undefined);
                }}
            />
        </Box>
    );
};

export default Budget;
