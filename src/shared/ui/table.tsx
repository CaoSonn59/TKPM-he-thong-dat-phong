import { Fragment, useState } from 'react'
import { Icon } from './Icon'

export function useSort<T extends object>(rows: T[], init: keyof T & string, initDir: 1 | -1 = 1) {
  const [s, setS] = useState<{ k: keyof T & string; d: 1 | -1 }>({ k: init, d: initDir })
  const sorted = [...rows].sort((a, b) => {
    const x = a[s.k], y = b[s.k]
    return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'vi')) * s.d
  })
  const th = (k: keyof T & string, label: string) => {
    const on = s.k === k
    return (
      <th aria-sort={on ? (s.d > 0 ? 'ascending' : 'descending') : undefined}>
        <button className={`thb ${on ? 'text-indigo-800' : ''}`} onClick={() => setS({ k, d: on && s.d > 0 ? -1 : 1 })}>
          {label}<Icon n={on ? (s.d > 0 ? 'sortUp' : 'sortDown') : 'sort'} s={16} className={on ? '' : 'text-gray-400'} />
        </button>
      </th>
    )
  }
  return { sorted, th }
}

export function usePaged<T>(rows: T[], initial = 10, sizes = true) {
  const [size, setSize] = useState(initial)
  const [page, setPage] = useState(1)
  const n = rows.length, pages = Math.max(1, Math.ceil(n / size)), p = Math.min(page, pages)
  const nums = [...new Set([1, p - 1, p, p + 1, pages])].filter(x => x >= 1 && x <= pages)
  const pager = (
    <div className="pager">
      <div className="flex items-center gap-2">
        Hiển thị {n ? (p - 1) * size + 1 : 0}–{Math.min(p * size, n)} trên {n}
        {sizes && <> · <select className="sel h-[34px] px-2" aria-label="Số dòng mỗi trang" value={size} onChange={e => { setSize(+e.target.value); setPage(1) }}>
          {[10, 20, 50].map(x => <option key={x} value={x}>{x} / trang</option>)}
        </select></>}
      </div>
      <div className="flex items-center gap-1">
        <button className="pb" disabled={p === 1} aria-label="Trang trước" onClick={() => setPage(p - 1)}><Icon n="left" s={16} /></button>
        {nums.map((x, i) => (
          <Fragment key={x}>
            {i > 0 && x - nums[i - 1] > 1 && <span className="muted px-1">…</span>}
            <button className={`pb ${x === p ? 'on' : ''}`} aria-current={x === p ? 'page' : undefined} onClick={() => setPage(x)}>{x}</button>
          </Fragment>
        ))}
        <button className="pb" disabled={p === pages} aria-label="Trang sau" onClick={() => setPage(p + 1)}><Icon n="right" s={16} /></button>
      </div>
    </div>
  )
  return { rows: rows.slice((p - 1) * size, p * size), pager }
}
