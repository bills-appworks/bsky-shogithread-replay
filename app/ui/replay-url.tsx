import { setTextAreaById, notoSansJP } from '@/app/lib/common';

// set...Stateすると再レンダリングでユーザresizeがリセットされるため直接設定
export function setReplayURLText(text: string) {
/*
  const element = document.getElementById("replay-url");
  if (element && element instanceof HTMLTextAreaElement) {
    element.value = text;
  }
*/
  setTextAreaById('replay-url', text);
}

const ReplayURL = () => {
  return (
    <div>
      <hr />
      <h2 className="text-lg font-bold">[再現URL]</h2>
      <textarea
        className={`w-full h-20 rounded border border-black bg-[#FFFFDD] ${notoSansJP.className}`}
        id="replay-url"
        name="replay-url"
//        key={resultDisplayState.replayURL}
//        defaultValue={resultDisplayState.replayURL}
        readOnly
      />
    </div>
  );
}

export default ReplayURL;
