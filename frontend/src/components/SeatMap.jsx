export default function SeatMap({ 
  exam, 
  bookedSeats, 
  selectedSeat, 
  onSelectSeat, 
  userBooking,
  currentUserId 
}) {
  const rows = exam.rows;
  const seatsPerRow = exam.seatsPerRow;
  const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const getSeatStatus = (seatNumber) => {
    if (!bookedSeats[seatNumber]) return 'available';
    if (bookedSeats[seatNumber].userId === currentUserId) return 'mine';
    return 'booked';
  };

  const getSeatStyle = (status, isSelected) => {
    const base = "seat-btn w-10 h-10 rounded-lg text-xs font-bold border-2 flex items-center justify-center cursor-pointer";
    
    if (isSelected) {
      return `${base} bg-yellow-400 border-yellow-300 text-black shadow-lg shadow-yellow-500/50 scale-110`;
    }
    
    switch (status) {
      case 'available':
        return `${base} bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-yellow-500`;
      case 'booked':
        return `${base} bg-red-900/50 border-red-700 text-red-400 cursor-not-allowed opacity-70`;
      case 'mine':
        return `${base} bg-green-800 border-green-500 text-green-300 cursor-not-allowed`;
      default:
        return base;
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      {/* Screen */}
      <div className="mb-8 text-center">
        <div className="inline-block">
          <div className="bg-gradient-to-b from-yellow-400/30 to-transparent border-t-4 border-yellow-500 
                          w-64 h-8 rounded-t-full mx-auto mb-2 flex items-center justify-center">
            <span className="text-yellow-400 text-xs font-bold tracking-widest">กระดาน / BOARD</span>
          </div>
          <p className="text-gray-500 text-xs">ด้านหน้าห้องสอบ</p>
        </div>
      </div>

      {/* Seat Grid */}
      <div className="flex flex-col items-center gap-2 min-w-max mx-auto px-4">
        {Array.from({ length: rows }, (_, rowIdx) => {
          const rowLabel = rowLabels[rowIdx];
          
          return (
            <div key={rowLabel} className="flex items-center gap-2">
              {/* Row Label */}
              <span className="text-gray-500 text-sm font-mono w-6 text-center">{rowLabel}</span>
              
              {/* Seats */}
              <div className="flex gap-2">
                {Array.from({ length: seatsPerRow }, (_, colIdx) => {
                  const col = colIdx + 1;
                  const seatNumber = `${rowLabel}${col}`;
                  const status = getSeatStatus(seatNumber);
                  const isSelected = selectedSeat === seatNumber;
                  const isDisabled = status === 'booked' || 
                                     (status === 'mine') || 
                                     (userBooking && status !== 'mine');

                  return (
                    <button
                      key={seatNumber}
                      className={getSeatStyle(status, isSelected)}
                      onClick={() => !isDisabled && onSelectSeat(seatNumber, rowLabel, col)}
                      disabled={isDisabled}
                      title={
                        status === 'booked' 
                          ? `${seatNumber} - ถูกจองแล้ว` 
                          : status === 'mine'
                          ? `${seatNumber} - ที่นั่งของคุณ`
                          : `เลือกที่นั่ง ${seatNumber}`
                      }
                    >
                      {status === 'mine' ? '★' : col}
                    </button>
                  );
                })}
              </div>
              
              {/* Row Label Right */}
              <span className="text-gray-500 text-sm font-mono w-6 text-center">{rowLabel}</span>
            </div>
          );
        })}

        {/* Column numbers */}
        <div className="flex items-center gap-2 mt-1">
          <span className="w-6"></span>
          <div className="flex gap-2">
            {Array.from({ length: seatsPerRow }, (_, i) => (
              <span key={i} className="w-10 text-center text-gray-600 text-xs">
                {i + 1}
              </span>
            ))}
          </div>
          <span className="w-6"></span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-8 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-700 border-2 border-gray-600"></div>
          <span className="text-gray-400 text-sm">ว่าง</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-yellow-400 border-2 border-yellow-300"></div>
          <span className="text-gray-400 text-sm">เลือกอยู่</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-900/50 border-2 border-red-700"></div>
          <span className="text-gray-400 text-sm">ถูกจองแล้ว</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-800 border-2 border-green-500"></div>
          <span className="text-gray-400 text-sm">ที่นั่งของคุณ</span>
        </div>
      </div>
    </div>
  );
}
