// components/CustomCalendar.tsx
import React from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

interface CustomCalendarProps {
    selected: Date | undefined;
    onSelect: (date: Date | undefined) => void;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({ selected, onSelect }) => {
    return (
        <div className="flex justify-center">
            <style>{`
  .rdp {
    --rdp-cell-size: 40px;
  }

  .rdp-caption {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    font-weight: bold;
    position: relative;
  }

  .rdp-caption_label {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    pointer-events: none;
  }

  .rdp-nav {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }

  .rdp-nav_button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    z-index: 1;
  }

  .selected-date{
    background-color: #f43f5e !important; /* Rose */
  color: white !important;
  border-radius: 9999px !important; /* Full circle */
  border: none !important;
}
`}</style>
            <DayPicker
                mode="single"
                selected={selected}
                onSelect={onSelect}
                modifiersClassNames={{
                    selected: 'selected-date',
                    today: 'today-date',
                }}
                disabled={{ before: new Date() }}
                className="bg-white rounded-lg shadow-md p-4"
            />

        </div>
    );
};

export default CustomCalendar;
