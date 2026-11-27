import React, { useState } from 'react';

/**
 * DynamicUpiQr - Generates a dynamic NPCI UPI QR code with pre-filled amount
 * @param {string} upiId - The recipient UPI ID (e.g. dilipbhai-bhargav@ptyes)
 * @param {string} upiName - Business name (e.g. ANMOL ARTS GALLERY)
 * @param {number|string} amount - Exact amount to be paid (e.g. 5000)
 * @param {string} orderId - Order identifier (e.g. ORD-1024)
 * @param {string} note - Optional transaction note
 * @param {string} staticFallback - Fallback static QR image
 */
export default function DynamicUpiQr({
  upiId = 'dilipbhai-bhargav@ptyes',
  upiName = 'ANMOL ARTS GALLERY',
  amount = 0,
  orderId = '',
  note = 'Artwork Payment',
  staticFallback = null,
  showActions = true,
  className = ''
}) {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const cleanAmount = Number(amount) || 0;
  const tn = orderId ? `Order ${orderId}` : note;

  // Standard NPCI UPI URI
  const upiUri = cleanAmount > 0
    ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${cleanAmount}&cu=INR&tn=${encodeURIComponent(tn)}`
    : `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&cu=INR&tn=${encodeURIComponent(tn)}`;

  // Multi-source dynamic QR URL with automatic failover
  const primaryQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=8&data=${encodeURIComponent(upiUri)}`;
  const secondaryQrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(upiUri)}&size=320&margin=2`;

  const handleCopyUpi = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(upiId);
      }
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className={`bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#E8E5DF] text-center space-y-3 shadow-sm ${className}`}>
      {/* Top Header Card */}
      <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-xl border border-[#E8E5DF] text-xs">
        <div className="flex items-center gap-1.5 text-left">
          <div className="w-6 h-6 rounded-full bg-sky-500 text-white font-bold text-[10px] flex items-center justify-center">
            AG
          </div>
          <div>
            <p className="font-bold text-[#1A1816] text-[11px] leading-tight flex items-center gap-1">
              <span>{upiName}</span>
              <span className="text-blue-500 text-[10px]">✓</span>
            </p>
            <p className="text-[10px] text-[#6B6560] font-mono leading-none">{upiId}</p>
          </div>
        </div>

        {cleanAmount > 0 && (
          <div className="text-right">
            <span className="text-[9px] uppercase tracking-wider text-[#6B6560] block font-semibold">Locked Amount</span>
            <span className="font-serif text-sm font-bold text-emerald-800">₹{cleanAmount.toLocaleString('en-IN')}</span>
          </div>
        )}
      </div>

      {/* QR Code Container */}
      <div className="relative inline-block mx-auto bg-white p-2.5 rounded-2xl shadow-md border border-[#E8E5DF]">
        {!imgError ? (
          <img
            src={primaryQrUrl}
            onError={(e) => {
              if (e.target.src !== secondaryQrUrl) {
                e.target.src = secondaryQrUrl;
              } else if (staticFallback) {
                e.target.src = staticFallback;
              } else {
                setImgError(true);
              }
            }}
            alt={`UPI QR Code for ₹${cleanAmount} to ${upiName}`}
            className="w-48 sm:w-52 h-48 sm:h-52 object-contain mx-auto rounded-xl"
            loading="eager"
          />
        ) : (
          staticFallback && (
            <img
              src={staticFallback}
              alt={`UPI QR Code to ${upiName}`}
              className="w-48 sm:w-52 h-auto object-contain mx-auto rounded-xl"
            />
          )
        )}

        {/* Amount badge on the QR container */}
        {cleanAmount > 0 && (
          <div className="mt-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200/80 px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1">
            <span>🔒 Scan to Pay Exact:</span>
            <span className="font-serif font-bold text-xs">₹{cleanAmount.toLocaleString('en-IN')}</span>
          </div>
        )}
      </div>

      {showActions && (
        <div className="space-y-2">
          {/* UPI ID Row with Copy */}
          <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-[#E8E5DF] text-xs">
            <div className="text-left truncate mr-2">
              <span className="text-[9px] text-[#6B6560] block uppercase font-semibold">Payee UPI VPA</span>
              <span className="font-mono font-bold text-[#1A1816] text-[11px] select-all">{upiId}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyUpi}
              className="px-3 py-1.5 bg-[#1A1816] hover:bg-[#B87333] text-white text-[11px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1 active:scale-95 flex-shrink-0"
            >
              <span>{copied ? '✓ Copied!' : '📋 Copy ID'}</span>
            </button>
          </div>

          {/* Direct Mobile UPI Intent Button */}
          <a
            href={upiUri}
            className="w-full py-2.5 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 hover:opacity-95 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-sm transition active:scale-98"
          >
            <span>📱 Pay ₹{cleanAmount > 0 ? cleanAmount.toLocaleString('en-IN') : ''} in UPI App (GPay/PhonePe/Paytm)</span>
          </a>

          <p className="text-[10px] text-[#6B6560]">
            Scan with any UPI app • Paytm • PhonePe • Google Pay • BHIM
          </p>
        </div>
      )}
    </div>
  );
}
