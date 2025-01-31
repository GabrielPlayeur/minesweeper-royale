
export default function Layout({ children }) {
    console.log('Layout rendu');
    return (
        <div className="flex flex-col justify-between h-screen bg-slate-500">
            <header className="flex flex-row justify-between bg-slate-800 items-center py-3 text-lime-600 md:px-6 rounded-b-md shadow-2xl shadow-lime-500/60">
                <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
                    <h1 className="text-3xl font-bold">Minesweeper</h1>
                </div>
                <div className="ml-auto flex-none">
                    <a href="/" className="border-2 rounded-lg p-1 px-3 hover:bg-slate-600 transform transition-all duration-500 hover:scale-150">Home</a>
                </div>
            </header>
            <div className="mx-auto">
                {children}
            </div>
            <footer className="bg-slate-800 p-1 text-lime-600 px-6 rounded-t-md shadow-2xl shadow-lime-500/60">
                <p className="text-center">2025</p>
            </footer>
        </div>
    );
}
