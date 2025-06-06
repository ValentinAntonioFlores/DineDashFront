// utils/checkOverlappingReservations.ts


export function filterOverlappingReservations(
    reservations: Array<{ tableId: string; startTime: string; endTime: string; status: string }>,
    selectedStartTime: string,
    selectedEndTime: string
) {
    return reservations.filter((res) => {
        if (res.status !== 'ACCEPTED') return false;

        return (
            new Date(res.startTime) < new Date(selectedEndTime) &&
            new Date(selectedStartTime) < new Date(res.endTime)
        );
    });
}

// No hace nada por el momento.
