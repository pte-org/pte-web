'use client';

import { ChevronLeftIcon, XIcon, cn } from '@pte/ui';
import type { ReactNode } from 'react';

export interface SidebarRenderContext {
    isSidebarOpen: boolean;
    isMobileSheet: boolean;
    onItemClick?: () => void;
}

type SidebarSlot = ReactNode | ((context: SidebarRenderContext) => ReactNode);

const renderSlot = (slot: SidebarSlot | undefined, context: SidebarRenderContext): ReactNode =>
    typeof slot === 'function' ? slot(context) : slot;

export default function Sidebar({
    isSidebarOpen,
    toggleSidebar,
    isMobileSheet = false,
    onItemClick,
    brand,
    children,
}: {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    isMobileSheet?: boolean;
    onItemClick?: () => void;
    brand?: SidebarSlot;
    children?: SidebarSlot;
}) {
    const context: SidebarRenderContext = {
        isSidebarOpen,
        isMobileSheet,
        onItemClick,
    };

    return (
        <div className='flex h-full flex-col overflow-hidden bg-card-surface-area'>
            {/* Header */}
            <div
                className={cn(
                    'flex items-center px-4 pt-7 text-text-primary',
                    isSidebarOpen
                        ? 'justify-between'
                        : 'flex-col justify-center gap-4',
                )}
            >
                {renderSlot(brand, context)}

                <button
                    type='button'
                    onClick={() => toggleSidebar()}
                    className={cn(
                        'p-1.5 transition-colors',
                        isMobileSheet
                            ? 'rounded-lg text-icon-tertiary hover:bg-background-gray-primary hover:text-text-primary'
                            : 'rounded-lg text-icon-tertiary hover:bg-background-gray-primary hover:text-text-secondary',
                    )}
                    aria-label={
                        isMobileSheet ? 'Close sidebar' : 'Toggle sidebar'
                    }
                >
                    {isMobileSheet ? (
                        <XIcon className='size-5' />
                    ) : (
                        <ChevronLeftIcon className='size-5' />
                    )}
                </button>
            </div>

            {/* Navigation */}
            <nav
                className={cn(
                    'scrollbar-thin flex flex-1 flex-col overflow-y-auto pb-4',
                    isSidebarOpen ? 'mt-7 space-y-6 px-4' : 'mt-5 gap-1 px-2',
                )}
            >
                {renderSlot(children, context)}
            </nav>
        </div>
    );
}
