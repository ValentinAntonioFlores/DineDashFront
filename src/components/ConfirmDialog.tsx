import { useState } from 'react';
import { toast } from 'sonner';

export function useConfirm() {
    return (message: string): Promise<boolean> => {
        return new Promise((resolve) => {
            const id = toast(
                <div className="flex flex-col gap-2">
                    <span>{message}</span>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => {
                                toast.dismiss(id);
                                resolve(false);
                            }}
                            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                toast.dismiss(id);
                                resolve(true);
                            }}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Yes, delete
                        </button>
                    </div>
                </div>,
                {
                    duration: Infinity,
                }
            );
        });
    };
}
