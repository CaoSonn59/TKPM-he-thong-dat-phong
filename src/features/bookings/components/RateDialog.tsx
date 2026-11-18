// U9 — Đánh giá / Sửa đánh giá
import { useState, type FormEvent } from 'react'
import { Icon, Modal } from '../../../shared/ui'
import { dmy, longDate } from '../../../shared/lib/format'
import { useRoomOf } from '../../rooms/hooks'
import { useBookingActions } from '../hooks'
import { addMonth } from '../logic'
import { STAR_LABELS, type Booking } from '../model'

const QUICK = ['Máy chiếu hỏng', 'Điều hòa không mát', 'Phòng bẩn', 'Thiếu bàn ghế']

export function RateDialog({ b, onClose }: { b: Booking; onClose: () => void }) {
  const roomOf = useRoomOf()
  const { saveFb } = useBookingActions()
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
