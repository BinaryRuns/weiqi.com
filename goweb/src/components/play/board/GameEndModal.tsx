const GameEndModal = ({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center">
      <div className="bg-bigcard text-white p-6 rounded-lg shadow-lg w-80 md:w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Black Won</h2>
          <button className="text-gray-400 hover:text-white" onClick={onClose}>
            &#10005;
          </button>
        </div>
        <p className="text-gray-400 mb-6">{message}</p>

        <button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg mb-4">
          Game Review
        </button>

        <div className="flex space-x-4">
          <button className="w-1/2 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg text-white">
            New 10 min
          </button>
          <button className="w-1/2 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg text-white">
            Rematch
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameEndModal;
