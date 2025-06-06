import React, { ReactNode } from 'react';

interface HomePageLayoutProps {
    heroContent?: ReactNode;
    searchForm?: ReactNode;
    section1?: ReactNode;
    section2?: ReactNode;
    footer?: ReactNode;
}

const HomePageLayout: React.FC<HomePageLayoutProps> = ({
                                                           heroContent,
                                                           searchForm,
                                                           section1,
                                                           section2,
                                                           footer,
                                                       }) => {
    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white text-gray-900 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 py-12 space-y-24">

            {/* HERO */}
            <section className="text-center space-y-6 max-w-4xl mx-auto">
                {heroContent}
                {searchForm}
            </section>

            {/* SECTION 1 */}
            {section1 && (
                <section className="max-w-6xl mx-auto space-y-6">
                    {section1}
                </section>
            )}

            {/* SECTION 2 */}
            {section2 && (
                <section className="max-w-6xl mx-auto space-y-6">
                    {section2}
                </section>
            )}

            {/* FOOTER */}
            {footer && (
                <footer className="border-t pt-12 mt-12 max-w-6xl mx-auto text-center text-sm text-gray-500">
                    {footer}
                </footer>
            )}
        </main>
    );
};

export default HomePageLayout;
