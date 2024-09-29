import { ReplayState, notoSansJP } from '@/app/lib/common';

const HistoryView = ({ replayState }: {replayState:  ReplayState }) => {
  return (
    <div>
      <hr />
      <h2 className="text-lg font-bold">[スレッド一覧]</h2>
      <textarea
        className={`w-full h-20 rounded border border-black bg-[#FFFFDD] ${notoSansJP.className}`}
        id="history-view"
        name="history-view"
        key={replayState.historyView}
        defaultValue={replayState.historyView}
        readOnly
      />
    </div>
  );
}

export default HistoryView;
