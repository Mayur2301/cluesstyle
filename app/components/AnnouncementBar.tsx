// app/components/AnnouncementBar.tsx
import { FaFire, FaGift, FaBolt, FaTag, FaTrophy } from 'react-icons/fa';

const announcements = [
  { icon: FaFire, text: 'Limited Time Offer: 30% Off Custom Tools', color: 'text-orange-500' },
  { icon: FaGift, text: 'Free Shipping on Orders Over $500', color: 'text-green-500' },
  { icon: FaBolt, text: 'New: AI Design Generator Now Live!', color: 'text-yellow-500' },
  { icon: FaTag, text: 'Summer Sale: Up to 40% Off Selected Items', color: 'text-blue-500' },
  { icon: FaTrophy, text: 'Join Our Loyalty Program & Earn Points', color: 'text-purple-500' },
];

export default function AnnouncementBar() {
  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[101] bg-black text-white overflow-hidden h-8">
        <div className="animate-marquee whitespace-nowrap flex items-center h-full">
          {[...announcements, ...announcements].map((item, idx) => (
            <div key={idx} className="inline-flex items-center gap-2 mx-4">
              <item.icon className={`w-4 h-4 ${item.color}`} />
              <span className="text-sm font-medium">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Add global styles */}
      
    </>
  );
}