import GoBoard from "../../components/Go/ruleset/logic";

const BoardPage = () => {
  return (
    <div className="flex flex-col items-center mt-10">
      <h1 className="text-3xl font-semibold mb-4">Go Board (19x19)</h1>
      <GoBoard />
    </div>
  );
};

export default BoardPage;
