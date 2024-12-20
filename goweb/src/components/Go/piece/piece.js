const Piece = ({ piece }) => {
    if (!piece) return null; // If the cell is empty, return null
  
    return (
      <div
        className={`w-6 h-6 rounded-full ${piece === "black" ? "bg-black" : "bg-white"}`}
      />
    );
  };
  
  export default Piece;
  