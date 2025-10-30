import { useRouter } from 'next/navigation';

interface Room {
  _id: string;
  name: string;
  members: Array<{
    userId: {
      _id: string;
      username: string;
      email: string;
    };
    joinedAt: string;
  }>;
  createdAt: string;
}

interface RoomListItemProps {
  room: Room;
  isActive: boolean;
  onRoomSelect: (roomId: string) => void;
}

export default function RoomListItem({ room, isActive, onRoomSelect }: RoomListItemProps) {
  const router = useRouter();

  const handleClick = () => {
    onRoomSelect(room._id);
  };

  const memberCount = room.members.length;

  return (
    <div
      onClick={handleClick}
      className={`p-4 mx-3 my-2 rounded-xl cursor-pointer transition-all duration-200 hover:bg-gray-700/50 dark:hover:bg-gray-600/50 backdrop-blur-sm border ${
        isActive
          ? 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg border-gray-500/50'
          : 'text-gray-300 hover:text-white border-gray-700/30 hover:border-gray-600/50'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-xs truncate mb-1">{room.name}</h3>
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-1">
              {room.members.slice(0, 3).map((member, index) => (
                <div
                  key={member.userId._id}
                  className="w-4 h-4 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full border border-gray-600 flex items-center justify-center"
                  style={{ zIndex: 3 - index }}
                >
                  <span className="text-xs font-bold text-white">
                    {member.userId.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              ))}
              {memberCount > 3 && (
                <div className="w-4 h-4 bg-gray-600 rounded-full border border-gray-600 flex items-center justify-center">
                  <span className="text-xs text-gray-300">+{memberCount - 3}</span>
                </div>
              )}
            </div>
            <span className="text-xs opacity-70">
              {memberCount} {memberCount === 1 ? 'member' : 'members'}
            </span>
          </div>
        </div>
        <div className="flex-shrink-0 ml-3">
          <div className={`w-2 h-2 rounded-full ${
            isActive ? 'bg-white' : 'bg-green-400'
          } animate-pulse`}></div>
        </div>
      </div>
    </div>
  );
}