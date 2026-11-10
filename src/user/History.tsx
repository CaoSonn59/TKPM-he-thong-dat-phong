// U6 — Lịch sử đặt phòng, U7 — Chi tiết lịch đặt (drawer), U8 — Hủy, U9 — Đánh giá / Sửa đánh giá
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { STAR_LABELS, STATUS, STATUSES, TODAY, dmy, longDate, when, type Booking, type Status } from '../data'
import { addMonth, canCancel, canRate } from '../logic'
import { Members, ReasonBox, RoomDl } from '../parts'
import { useStore } from '../store'
import { Badge, Confirm, Drawer, Empty, Icon, Modal, Stars } from '../ui'

const QUICK = ['Máy chiếu hỏng', 'Điều hòa không mát', 'Phòng bẩn', 'Thiếu bàn ghế']

function Rate({ b, onClose }: { b: Booking; onClose: () => void }) {
  const { roomOf, saveFb } = useStore()
  const [stars, setStars] = useState(b.fb?.stars ?? 0)
  const [text, setText] = useState(b.fb?.text ?? '')
  const [err, setErr] = useState(false)
  const submit = (e: FormEvent) => { e.preventDefault(); if (!stars) return setErr(true); saveFb(b.id, stars, text); onClose() }
  return (
    <Modal title={b.fb ? 'Sửa đánh giá' : 'Đánh giá phòng'} w="md:max-w-[460px]" onClose={onClose}
      footer={<><button className="btn" onClick={onClose}>Hủy</button><button className="btn bp" form="rate-form">Lưu phản hồi</button></>}>
      <form id="rate-form" className="mb gap-4!" onSubmit={submit}>
        <div className="px-3.5 py-3 rounded-xl bg-gray-50 border border-gray-100"><div className="font-semibold">{roomOf(b.roomId).name} · {b.title}</div><div className="small muted">{longDate(b.date)} · {b.from} – {b.to}</div></div>
        <fieldset>
          <legend className="lb">Mức độ hài lòng <span className="req">*</span></legend>
          <div className="flex items-center gap-3">
            <div className="flex gap-1" role="radiogroup" aria-label="Số sao">
              {STAR_LABELS.map((l, i) => (
                <button key={l} type="button" role="radio" aria-checked={stars === i + 1} aria-label={`${i + 1} sao, ${l}`} title={l}
                  className={`st ${i < stars ? 'on' : ''}`} onClick={() => { setStars(i + 1); setErr(false) }}><Icon n="star" s={32} /></button>
              ))}
            </div>
            <span className="font-semibold text-amber-800">{STAR_LABELS[stars - 1]}</span>
          </div>
          {err && <div className="err" role="alert"><Icon n="alert" s={16} />Vui lòng chọn số sao</div>}
        </fieldset>
        <div>
          <span className="lb">Thêm nhanh</span>
          <div className="qt flex flex-wrap gap-1.5">
            {QUICK.map(t => <button key={t} type="button" aria-pressed={text.includes(t)} onClick={() => setText(text.includes(t) ? text.replace(t + '. ', '').replace(t, '') : `${t}. ${text}`)}>{t}</button>)}
          </div>
        </div>
        <div>
          <label className="lb" htmlFor="rate-text">Nội dung</label>
          <textarea id="rate-text" className="inp min-h-24!" placeholder="Mô tả tình trạng phòng, thiết bị hỏng (máy chiếu, điều hòa…), vệ sinh…" value={text} onChange={e => setText(e.target.value)} />
        </div>
        {b.fb && <p className="small muted">Đã gửi ngày {dmy(b.fb.at)} · sửa được đến hết {dmy(addMonth(b.date))}</p>}
      </form>
    </Modal>
  )
}

function Detail({ b, onClose, onCancel, onRate }: { b: Booking; onClose: () => void; onCancel: () => void; onRate: () => void }) {
  const { me, roomOf, groupName, userLabel } = useStore()
  const own = b.by === me!.id, cancelable = canCancel(b, me!.id), ratable = canRate(b, me!.id, TODAY)
  return (
    <Drawer label={b.title} onClose={onClose}>
      <div className="dh"><div><Badge s={b.status} /><h2 className="text-[19px] font-bold mt-2">{b.title}</h2></div><button className="ib" aria-label="Đóng" onClick={onClose}><Icon n="x" /></button></div>
      <div className="flex-auto overflow-y-auto">
        <ReasonBox b={b} self={own} />
        <section className="sec"><h3 className="sh">Thông tin sự kiện</h3>
          <dl className="dl">
            <dt>Ngày</dt><dd>{longDate(b.date)}</dd><dt>Thời gian</dt><dd>{b.from} – {b.to}</dd>
            <dt>Người đặt</dt><dd>{own ? <span className="you">Bạn</span> : userLabel(b.by)}</dd><dt>Đặt cho</dt><dd>{groupName(b.groupId)}</dd>
          </dl>
        </section>
        <section className="sec"><h3 className="sh">Thông tin phòng</h3><RoomDl r={roomOf(b.roomId)} /></section>
        <Members b={b} search />
        {b.fb && own && (
          <section className="sec"><h3 className="sh">Phản hồi của bạn</h3>
            <div className="p-3.5 border border-gray-200 rounded-[10px]">
              <div className="flex items-center gap-2"><Stars n={b.fb.stars} className="text-lg" /><span className="font-semibold">{STAR_LABELS[b.fb.stars - 1]}</span></div>
              {b.fb.text && <p className="mt-1.5">{b.fb.text}</p>}
              <p className="small muted mt-1.5">Gửi ngày {dmy(b.fb.at)}</p>
            </div>
            {ratable && <p className="small muted">Bạn có thể sửa đánh giá đến hết {dmy(addMonth(b.date))}.</p>}
          </section>
        )}
      </div>
      {(cancelable || ratable) && (
        <div className="mf">
          {cancelable && <button className="btn bo" onClick={onCancel}>Hủy đặt phòng</button>}
          {ratable && <button className="btn bp" onClick={onRate}>{b.fb ? 'Sửa đánh giá' : 'Đánh giá'}</button>}
        </div>
      )}
    </Drawer>
  )
}

export default function History() {
  const { bookings, me, myGroups, roomOf, groupName, userLabel, setStatus, toast } = useStore()
  const [tab, setTab] = useState<Status | ''>('')
  const [f, setF] = useState({ src: '', from: '', to: '' })
  const [view, setView] = useState<number | null>(null)
  const [cancel, setCancel] = useState<Booking | null>(null)
  const [rate, setRate] = useState<Booking | null>(null)
  const id = me!.id

  // Gồm lịch tự đặt và lịch của các nhóm mình là thành viên.
  const all = bookings.filter(b => b.by === id || myGroups.some(g => g.id === b.groupId))
  const mine = all.filter(b => (!f.src || (f.src === 'self' ? b.groupId === null : b.groupId === +f.src)) && (!f.from || b.date >= f.from) && (!f.to || b.date <= f.to))
  const list = mine.filter(b => !tab || b.status === tab)
  const key = (b: Booking) => b.date + b.from
  // Lịch sắp diễn ra lên đầu, sau đó lịch cũ từ mới đến cũ.
  const sections: [string, Booking[]][] = [
    ['Sắp tới và đang diễn ra', list.filter(b => b.date >= TODAY).sort((a, b) => key(a).localeCompare(key(b)))],
    ['Đã qua', list.filter(b => b.date < TODAY).sort((a, b) => key(b).localeCompare(key(a)))],
  ]
  const viewing = bookings.find(b => b.id === view)
  const clear = () => { setF({ src: '', from: '', to: '' }); setTab('') }

  const acts = (b: Booking) => <>
    <button className="ab" onClick={() => setView(b.id)}>Xem</button>
    {canCancel(b, id) && <button className="ab red" onClick={() => setCancel(b)}>Hủy</button>}
    {canRate(b, id, TODAY) && <button className="ab pri" onClick={() => setRate(b)}>{b.fb ? 'Sửa đánh giá' : 'Đánh giá'}</button>}
  </>
  const who = (b: Booking) => b.by === id ? <span className="you">Bạn</span> : userLabel(b.by)

  return <>
    <h1 className="text-[22px] md:text-2xl font-bold">Lịch sử đặt phòng</h1>
    {all.length === 0 ? (
      <div className="card rounded-2xl!"><Empty icon="cal" title="Bạn chưa có lịch đặt phòng nào"><Link className="btn bp" to="/">Tìm phòng ngay</Link></Empty></div>
    ) : (
      <section className="card rounded-[14px]! max-md:bg-transparent! max-md:border-0!">
        <div className="tabs max-md:-mx-4" role="tablist" aria-label="Lọc theo trạng thái">
          {(['', ...STATUSES] as const).map(s => (
            <button key={s} className={`tab ${tab === s ? 'on' : ''}`} role="tab" aria-selected={tab === s} onClick={() => setTab(s)}>
              {s ? STATUS[s][0] : 'Tất cả'} <span className="tc">{mine.filter(b => !s || b.status === s).length}</span>
            </button>
          ))}
        </div>
        <div className="filters max-md:px-0! max-md:border-0!">
          <label className="small muted" htmlFor="h-src">Nguồn</label>
          <select className="sel" id="h-src" value={f.src} onChange={e => setF({ ...f, src: e.target.value })}>
            <option value="">Tất cả</option><option value="self">Cá nhân</option>{myGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <input className="inp w-[150px]!" type="date" aria-label="Từ ngày" value={f.from} onChange={e => setF({ ...f, from: e.target.value })} />
          <span className="muted">–</span>
          <input className="inp w-[150px]!" type="date" aria-label="Đến ngày" value={f.to} onChange={e => setF({ ...f, to: e.target.value })} />
          <button className="btn gh" onClick={clear}>Xóa lọc</button>
        </div>

        {list.length === 0 ? <Empty title="Không có lịch đặt phù hợp" text="Thử chọn tab khác hoặc bỏ bớt bộ lọc."><button className="btn" onClick={clear}>Xóa lọc</button></Empty> : <>
          {/* Desktop: bảng */}
          <div className="tw max-md:hidden">
            <table className="tbl">
              <thead><tr><th>Tiêu đề</th><th>Phòng</th><th>Thời gian</th><th>Đặt cho</th><th>Người đặt</th><th>Trạng thái</th><th className="text-right!">Thao tác</th></tr></thead>
              {sections.map(([label, rows]) => rows.length > 0 && (
                <tbody key={label}>
                  <tr className="grp"><td colSpan={7}>{label}</td></tr>
                  {rows.map(b => (
                    <tr key={b.id}>
                      <td className="font-semibold">{b.title}</td><td className="nw">{roomOf(b.roomId).name}</td><td className="nw">{when(b)}</td>
                      <td className="nw">{groupName(b.groupId)}</td><td className="nw">{who(b)}</td><td><Badge s={b.status} /></td>
                      <td><div className="flex justify-end gap-1">{acts(b)}</div></td>
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
          {/* Mobile: card */}
          <div className="md:hidden flex flex-col gap-3">
            {sections.map(([label, rows]) => rows.length > 0 && (
              <div key={label} className="contents">
                <div className="text-xs font-semibold tracking-wide uppercase text-gray-600 mt-1.5">{label}</div>
                {rows.map(b => (
                  <article key={b.id} className="bk">
                    <div className="flex justify-between items-start gap-2"><h2 className="text-base font-semibold">{b.title}</h2><Badge s={b.status} /></div>
                    <div className="ln">{roomOf(b.roomId).name} · {when(b)}</div>
                    <div className="ln">{groupName(b.groupId)} · {b.by === id ? who(b) : <>đặt bởi {who(b)}</>}</div>
                    {b.reason?.text && <p className="small px-2.5 py-2 rounded-lg bg-gray-100 text-gray-700">{b.status === 'no' ? 'Lý do từ chối' : 'Lý do hủy'}: {b.reason.text}</p>}
                    <div className="flex gap-2 pt-2 border-t border-gray-100">{acts(b)}</div>
                  </article>
                ))}
              </div>
            ))}
          </div>
          <div className="px-4 py-3 text-[13px] text-gray-600 max-md:px-0">Hiển thị {list.length} lịch đặt</div>
        </>}
      </section>
    )}

    {viewing && <Detail b={viewing} onClose={() => setView(null)} onCancel={() => setCancel(viewing)} onRate={() => setRate(viewing)} />}
    {cancel && (
      <Confirm title="Hủy lịch đặt phòng?" icon="ban" ok="Đồng ý hủy" cancel="Không" reason="Lý do hủy (không bắt buộc)" placeholder="Ví dụ: Nhóm đổi lịch họp" onClose={() => setCancel(null)}
        onOk={r => { setStatus(cancel.id, 'cancel', r, 'user'); toast('Hủy đặt phòng thành công', 'Lịch chuyển sang tab “Đã hủy”.'); setCancel(null) }}>
        <strong className="text-gray-900">{cancel.title}</strong> – {roomOf(cancel.roomId).name}, {when(cancel)}. Khung giờ sẽ được giải phóng cho người khác đặt.
      </Confirm>
    )}
    {rate && <Rate b={rate} onClose={() => setRate(null)} />}
  </>
}
