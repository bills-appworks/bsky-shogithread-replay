import { ResultDisplayState, notoSansJP } from '@/app/lib/common';

const ReplayURL = ({ resultDisplayState }: {resultDisplayState:  ResultDisplayState }) => {
  return (
    <div>
      <hr />
      <h2 className="text-lg font-bold">[再現URL]</h2>
      <textarea
        className={`w-full h-15 rounded border border-black bg-[#FFFFDD] ${notoSansJP.className}`}
        id="replay-url"
        name="replay-url"
        key={resultDisplayState.replayURL}
        defaultValue={resultDisplayState.replayURL}
        readOnly
      />
    </div>
  );
}

export default ReplayURL;
