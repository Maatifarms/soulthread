import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc, getDoc } from 'firebase/firestore'
import { db } from '../../services/firebase'
import { useAuth } from '../../contexts/AuthContext'
import { Star, MessageCircle } from 'lucide-react'

export default function MySessions() {
  const { currentUser } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [ratingLoading, setRatingLoading] = useState(null)

  const submitRating = async (bookingId, guideId, rating) => {
    try {
      setRatingLoading(bookingId)
      // 1. Update booking
      await updateDoc(doc(db, 'bookings', bookingId), { rating })
      
      // 2. Update guide average rating
      const guideRef = doc(db, 'guides', guideId)
      const guideSnap = await getDoc(guideRef)
      if (guideSnap.exists()) {
        const data = guideSnap.data()
        const currentTotal = (data.rating || 0) * (data.ratingCount || 0)
        const newCount = (data.ratingCount || 0) + 1
        const newAvg = (currentTotal + rating) / newCount
        
        await updateDoc(guideRef, {
          rating: Number(newAvg.toFixed(1)),
          ratingCount: newCount
        })
      }
    } catch (err) {
      console.error('Error submitting rating:', err)
      alert('Could not submit rating.')
    } finally {
      setRatingLoading(null)
    }
  }

  useEffect(() => {
    if (!currentUser) return
    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q, snap => {
      setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsub()
  }, [currentUser])

  if (loading) return <p style={{ color:'var(--color-text-muted)', padding:'16px' }}>Loading sessions...</p>
  if (sessions.length === 0) return (
    <p style={{ color:'var(--color-text-muted)', padding:'16px', fontStyle:'italic' }}>
      No sessions yet. Find a psychologist in the Experts tab.
    </p>
  )

  const statusColor = { pending:'#f59e0b', confirmed:'#22c55e', cancelled:'#ef4444', completed:'#6b7280' }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'12px', padding:'16px 0' }}>
      {sessions.map(s => (
        <div key={s.id} style={{
          padding:'14px 16px', borderRadius:'12px',
          border:'1px solid var(--color-border)',
          background:'var(--color-surface)'
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
            {s.guidePhotoURL && (
              <img src={s.guidePhotoURL} alt={s.guideName}
                style={{ width:'36px', height:'36px', borderRadius:'50%', objectFit:'cover' }} />
            )}
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:'600', fontSize:'14px' }}>{s.guideName}</div>
              <div style={{ fontSize:'12px', color:'var(--color-text-muted)' }}>
                {s.date} · {s.slot} · {s.durationMinutes || 50} min
              </div>
            </div>
            <span style={{
              fontSize:'11px', fontWeight:'700', padding:'3px 10px',
              borderRadius:'20px', background: statusColor[s.status] + '22',
              color: statusColor[s.status], textTransform:'uppercase'
            }}>
              {s.status}
            </span>
          </div>
          <div style={{ fontSize:'13px', color:'var(--color-text-muted)' }}>
            ₹{s.sessionRate} · 50 min session
          </div>
          
          {/* Join Session Button */}
          {s.status === 'confirmed' && s.meetLink && (
            <div style={{ marginTop: '12px' }}>
              <a href={s.meetLink} target="_blank" rel="noreferrer"
                 style={{ display: 'inline-block', padding: '8px 16px', background: 'var(--color-primary)', color: 'white', textDecoration: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold' }}>
                Join Session
              </a>
            </div>
          )}

          {/* Message Guide Button */}
          {(s.status === 'confirmed' || s.status === 'completed') && (
            <a href={`/messages?with=${s.guideId}&name=${encodeURIComponent(s.guideName || 'Guide')}`}
               style={{
                   display: 'inline-flex', alignItems: 'center', gap: '6px',
                   marginTop: '8px', marginRight: '8px',
                   padding: '7px 14px', borderRadius: '8px',
                   border: '1.5px solid var(--color-border)',
                   background: 'transparent', color: 'var(--color-text-secondary)',
                   fontSize: '13px', fontWeight: '600', textDecoration: 'none'
               }}>
               <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><MessageCircle size={14} /> Message</span>
            </a>
          )}

          {/* Rating UI */}
          {s.status === 'completed' && !s.rating && (
            <div style={{ marginTop: '12px', padding: '12px', background: 'var(--color-surface-soft)', borderRadius: '8px' }}>
              <p style={{ fontSize: '13px', margin: '0 0 8px 0', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>How was your session?</p>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} onClick={() => submitRating(s.id, s.guideId, star)}
                          disabled={ratingLoading === s.id}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <Star size={20} color="#fbbf24" fill={ratingLoading === s.id ? "#e5e7eb" : "none"} />
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Show Submitted Rating */}
          {s.status === 'completed' && s.rating && (
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24' }}>
              <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginRight: '4px' }}>You rated:</span>
              {[...Array(s.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
