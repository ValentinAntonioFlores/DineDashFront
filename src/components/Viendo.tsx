import { useUser } from './UserContext';
import TableSelection from "../RestaurantLayout/UserTableSelection.tsx";
import TableManagement from "../RestaurantLayout/TableManagement.tsx";

const RestaurantDashboard: React.FC = () => {
    const { role } = useUser();

    return (
        <div>
            {role === 'restaurant' ? <TableManagement /> : <TableSelection />}
        </div>
    );
};
