import { Box, useColorMode } from '@chakra-ui/react';
import ReactDatePicker, { ReactDatePickerProps } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DatePickerStyle = (isLightMode = true) => ({
  '--light-gray': isLightMode ? 'var(--chakra-colors-white)' : 'var(--chakra-colors-gray-700)',
  '--gray': isLightMode ? 'var(--chakra-colors-gray-300)' : 'var(--chakra-colors-gray-500)',
  '--blue700': isLightMode ? 'var(--chakra-colors-blue-600)' : 'var(--chakra-colors-blue-600)',
  '--blue600': isLightMode ? 'var(--chakra-colors-blue-500)' : 'var(--chakra-colors-blue-300)',
  '--blue500': isLightMode ? 'var(--chakra-colors-gray-400)' : 'var(--chakra-colors-gray-500)',
  '--blue400': isLightMode ? 'var(--chakra-colors-gray-300)' : 'var(--chakra-colors-gray-600)',
  '--blue300': isLightMode ? 'var(--chakra-colors-gray-200)' : 'var(--chakra-colors-gray-700)',
  '--blue200': isLightMode ? 'var(--chakra-colors-gray-200)' : 'var(--chakra-colors-gray-600)',
  '--blue100': isLightMode ? 'var(--chakra-colors-gray-100)' : 'var(--chakra-colors-gray-800)',
  '--monthBackground': isLightMode ? 'var(--chakra-colors-white)' : 'var(--chakra-colors-gray-700)',
  '--text': isLightMode ? 'var(--chakra-colors-black)' : 'var(--chakra-colors-gray-200)',
  '--negative-text': isLightMode ? 'var(--chakra-colors-white)' : 'var(--chakra-colors-black)',
  '.react-datepicker': {
    fontFamily: 'unset',
    fontSize: '0.9rem',
    borderColor: 'var(--gray)',
  },
  '.react-datepicker-wrapper': {
    display: 'block',
    backgroundColor: 'var(--light-gray)',
    borderRadius: '6px',
    border: '1px solid var(--gray)',
    ':focus-within': {
      zIndex: '1',
      borderColor: 'var(--blue600)',
      boxShadow: '0 0 0 1px var(--blue600)',
    },
  },
  '.react-datapicker__input-text': {
    background: 'none',
    outline: 'none',
    width: '100%',
    padding: '5px',
    fontSize: '1rem',
    height: '2.5rem',
  },
  '.react-datepicker__navigation--next--with-time:not(.react-datepicker__navigation--next--with-today-button)': {
    right: '90px',
  },
  '.react-datepicker__navigation--previous, .react-datepicker__navigation--next': {
    top: '8px',
  },
  '.react-datepicker__navigation--previous': {
    borderRightColor: 'var(--blue400)',
  },
  '.react-datepicker__navigation--previous:hover': {
    borderRightColor: 'var(--blue500)',
  },
  '.react-datepicker__navigation--next': {
    borderLeftColor: 'var(--blue400)',
  },
  '.react-datepicker__navigation--next:hover': {
    borderLeftColor: 'var(--blue500)',
  },
  '.react-datepicker__header': {
    backgroundColor: 'var(--blue100)',
  },
  '.react-datepicker__header, .react-datepicker__time-container': {
    borderColor: 'var(--blue300)',
  },
  '.react-datepicker__current-month, .react-datepicker-time__header, .react-datepicker-year-header': {
    fontSize: 'inherit',
    fontWeight: '600',
    color: 'var(--text)',
  },
  '.react-datepicker__month': {
    backgroundColor: 'var(--monthBackground)',
    margin: '0',
    padding: '0.4rem',
  },
  '.react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item':
    {
      margin: '0 1px 0 0',
      height: 'auto',
      padding: '7px 10px',
    },
  '.react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item:hover':
    {
      background: 'var(--blue200)',
    },
  '.react-datepicker__day': {
    color: 'var(--text)',
  },
  '.react-datepicker__day:hover': {
    background: 'var(--blue200)',
  },
  '.react-datepicker__day-name': {
    color: 'var(--text)',
  },
  '.react-datepicker__day--selected, .react-datepicker__day--in-selecting-range, .react-datepicker__day--in-range, .react-datepicker__month-text--selected, .react-datepicker__month-text--in-selecting-range, .react-datepicker__month-text--in-range, .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item--selected':
    {
      background: 'var(--blue600)',
      fontWeight: 'normal',
      color: 'var(--negative-text)',
    },
  '.react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item--selected:hover':
    {
      background: 'var(--blue700)',
    },
  '.react-datepicker__close-icon::after': {
    backgroundColor: 'unset',
    borderRadius: 'unset',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'var(--light-gray)',
    height: '20px',
    width: '20px',
  },
  '.react-datepicker__close-icon::after:hover': {
    color: 'var(--gray)',
  },
  '.react-datepicker__day--keyboard-selected, .react-datepicker__month-text--keyboard-selected, .react-datepicker__quarter-text--keyboard-selected, .react-datepicker__year-text--keyboard-selected':
    {
      background: 'transparent',
    },
});

interface DatePickerProps extends ReactDatePickerProps {
  placeholderProp?: never;
}

const DatePicker = ({ selected, onChange }: DatePickerProps) => {
  const isLightMode = useColorMode().colorMode === 'light';

  return (
    <Box sx={DatePickerStyle(isLightMode)}>
      <ReactDatePicker selected={selected} onChange={onChange} className='react-datapicker__input-text' />
    </Box>
  );
};

export default DatePicker;
