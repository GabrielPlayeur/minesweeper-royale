import { NB_BOMBS } from "../hooks/useGameLogic";
import AnimatedText from "./ui/animatedText";

const GameStatus = ({ placedFlags, remainingCells, toggleDig, dig }: { placedFlags: number, remainingCells: number, toggleDig: () => void, dig: boolean }) => {

  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-3 md:gap-4 p-4">
      <button
        onClick={toggleDig}
        className="relative row-span-1 col-span-2 ring-2 ring-lime-600 rounded-lg bg-lime-500/60 w-full overflow-hidden hover:bg-lime-400/60 hover:scale-105 active:scale-80 md:active:scale-110 hover:shadow-lg transition-all duration-500 md:duration-300 ease-in-out"
      >
        {dig ? <>🔨<br />Dig</> : <>🚩<br />Flag</>}
        <img src="/mouse-left-click.svg" alt="Mon SVG" className="absolute left-4/5 top-0 transform -translate-x-1/3 translate-y-1/6 w-1/2 opacity-70" />
      </button>
      <AnimatedText text={`💣 Bombs`} animatedText={`${NB_BOMBS - placedFlags}`} className={"col-span-1 row-span-1 bg-lime-200/80 rounded-lg py-4 px-2 text-center"} />
      <AnimatedText text={`🔳 Cells`} animatedText={`${remainingCells}`} className={"col-span-1 row-span-1 bg-lime-200/80 rounded-lg py-4 px-2 text-center"} />
    </div>
  );

};

export default GameStatus;
