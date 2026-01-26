import { useWeddingStore } from '../store/weddingStore'
import { Link } from 'react-router-dom'

export default function DetailedBudget() {
    const { budgetItems, wedding, updateBudgetItem, populateDefaultBudget, addBudgetItem, deleteBudgetItem } = useWeddingStore()

    const handleAddRow = () => {
        addBudgetItem({
            category: 'Other',
            vendor: 'New Item',
            estimatedCost: 0,
            actualCost: 0,
            paid: 0,
            dueDate: '',
            notes: ''
        })
    }

    const totalBudget = wedding.totalBudget
    const totalEstimated = budgetItems.reduce((sum, item) => sum + item.estimatedCost, 0)
    const totalActual = budgetItems.reduce((sum, item) => sum + item.actualCost, 0)
    const totalDifference = totalEstimated - totalActual

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif text-gray-800">Detailed Budget Table</h1>
                    <p className="text-gray-500">Comprehensive breakdown of all wedding expenses</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleAddRow} className="btn-primary flex items-center gap-2">
                        <span>➕</span> Add New Item
                    </button>
                    <button
                        onClick={() => {
                            if (window.confirm('This will replace your current budget items with a comprehensive checklist. Continue?')) {
                                populateDefaultBudget()
                            }
                        }}
                        className="btn-secondary flex items-center gap-2"
                    >
                        📋 Populate Standard Items
                    </button>
                    <Link to="/budget" className="btn-secondary">
                        ← Back to Overview
                    </Link>
                </div>
            </div>

            {/* Summary Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Estimated</p>
                    <p className="text-3xl font-serif text-gray-800">${totalEstimated.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Actual</p>
                    <p className={`text-3xl font-serif ${totalActual > totalBudget ? 'text-red-600' : 'text-primary-600'}`}>
                        ${totalActual.toLocaleString()}
                    </p>
                </div>
                <div className="bg-primary-600 p-6 rounded-[2rem] shadow-lg text-white text-center">
                    <p className="text-xs font-bold text-primary-100 uppercase tracking-widest mb-1">Master Budget</p>
                    <p className="text-3xl font-serif">${totalBudget.toLocaleString()}</p>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Category</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Item / Vendor</th>
                                <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Estimated Cost</th>
                                <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Actual Cost</th>
                                <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Difference</th>
                                <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {budgetItems.map((item) => {
                                const diff = item.estimatedCost - item.actualCost
                                return (
                                    <tr key={item.id} className="hover:bg-primary-50/30 transition-colors group">
                                        <td className="px-8 py-5">
                                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="font-medium text-gray-800">{item.vendor || 'Unnamed Item'}</p>
                                            {item.notes && <p className="text-xs text-gray-400 mt-1 italic">{item.notes}</p>}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <span className="text-gray-400 text-xs">$</span>
                                                <input
                                                    type="number"
                                                    className="bg-transparent text-right font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-200 rounded px-2 py-1 w-24 transition-all"
                                                    value={item.estimatedCost}
                                                    onChange={(e) => updateBudgetItem(item.id, { estimatedCost: Number(e.target.value) })}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <span className="text-gray-400 text-xs">$</span>
                                                <input
                                                    type="number"
                                                    className="bg-transparent text-right font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-200 rounded px-2 py-1 w-24 transition-all"
                                                    value={item.actualCost}
                                                    onChange={(e) => updateBudgetItem(item.id, { actualCost: Number(e.target.value) })}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <span className={`font-bold ${diff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {diff >= 0 ? '+' : ''}{diff.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button
                                                onClick={() => deleteBudgetItem(item.id)}
                                                className="p-2 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-colors"
                                                title="Delete Line"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                        <tfoot className="bg-gray-50/80 font-bold">
                            <tr>
                                <td colSpan={2} className="px-8 py-6 text-gray-800 uppercase tracking-widest text-xs">Total Wedding Investment</td>
                                <td className="px-8 py-6 text-right text-gray-800 underline decoration-primary-200 underline-offset-4 decoration-2">
                                    ${totalEstimated.toLocaleString()}
                                </td>
                                <td className="px-8 py-6 text-right text-primary-600 underline decoration-primary-300 underline-offset-4 decoration-2">
                                    ${totalActual.toLocaleString()}
                                </td>
                                <td className={`px-8 py-6 text-right ${totalDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {totalDifference >= 0 ? 'Under' : 'Over'} by ${Math.abs(totalDifference).toLocaleString()}
                                </td>
                                <td className="px-8 py-6 bg-gray-50/10 border-t border-gray-100"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Pro Tips Section */}
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-8 rounded-[2rem] text-white shadow-xl">
                <div className="flex items-start gap-4">
                    <div className="text-2xl">💡</div>
                    <div>
                        <h3 className="text-lg font-bold mb-2">Budgeting Pro-Tip</h3>
                        <p className="text-primary-50/80 leading-relaxed text-sm">
                            You can edit the costs directly in the table above! We've pre-populated the core items (Venue, Attire, Flowers) based on typical wedding distributions. As you get quotes from vendors, update the "Actual" column to stay on track.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
