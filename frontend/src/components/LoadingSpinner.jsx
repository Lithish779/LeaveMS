const LoadingSpinner = ({ fullScreen = false, size = 'md' }) => {
    const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };

    const spinner = (
        <div className={`animate-spin rounded-full border-2 border-slate-700 border-t-indigo-500 ${sizes[size]}`} />
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50">
                <div className="flex flex-col items-center gap-4">
                    {spinner}
                    <p className="text-slate-400 text-sm animate-pulse">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center py-10">
            {spinner}
        </div>
    );
};

export default LoadingSpinner;
