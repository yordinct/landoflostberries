const fs = require('fs');
let data = fs.readFileSync('src/components/League.tsx', 'utf8');

const regex = /<div className="relative group inline-block z-30">[\s\S]*?<div className="text-\[8px\] uppercase font-bold text-slate-500 mb-1">Available Heroes<\/div>/;

data = data.replace(regex, (match) => {
    return `<div className="relative inline-block z-30">
                                          <button 
                                             onClick={() => setAssignDropdownId(assignDropdownId === div.captainId ? null : div.captainId)}
                                             disabled={div.subordinateIds.length >= maxSubs} 
                                             className="text-[10px] px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/20 uppercase font-black tracking-widest hover:bg-indigo-500/30 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
                                             <Plus size={10} /> Assign
                                          </button>
                                       {div.subordinateIds.length < maxSubs && assignDropdownId === div.captainId && (
                                         <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded z-50 shadow-xl p-2 w-48 max-h-48 overflow-y-auto">
                                            <div className="flex justify-between items-center mb-1">
                                               <div className="text-[8px] uppercase font-bold text-slate-500">Available Heroes</div>
                                               <button onClick={() => setAssignDropdownId(null)} className="text-slate-500 hover:text-white"><X size={10}/></button>
                                            </div>`;
});

fs.writeFileSync('src/components/League.tsx', data);
console.log('Fixed assign button hover issue');
