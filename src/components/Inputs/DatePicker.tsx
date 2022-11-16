import ReactDatePicker, { ReactDatePickerProps } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DatePickerProps extends ReactDatePickerProps {
  placeholderProp?: never;
}

const DatePicker = ({ selected, onChange }: DatePickerProps) => {
  return <ReactDatePicker selected={selected} onChange={onChange} />;
};

export default DatePicker;
