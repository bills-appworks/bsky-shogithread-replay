import Link from "next/link";
import { ResultDisplayState, notoSansJP } from '@/app/lib/common';

const postLinkButtonText = 'リプレイ中の現在指し手ポストをBlueskyで開く';

//const HistoryView = ({ replayState }: {replayState:  ReplayState }) => {
const HistoryView = ({ resultDisplayState, postURLState, }: { resultDisplayState:  ResultDisplayState, postURLState: string, }) => {
  return (
    <div className="flex flex-col">
      <hr />
      <h2 className="text-lg font-bold">[スレッド一覧]</h2>
      <div className="space-y">
        <textarea
          className={`w-full h-20 rounded border border-black bg-[#FFFFDD] ${notoSansJP.className}`}
          id="history-view"
          name="history-view"
          key={resultDisplayState.historyView}
          defaultValue={resultDisplayState.historyView}
          readOnly
        />
        <div className="flex justify-center">
          <button className="ml-2 bg-[#FFE581] hover:bg-[#EFD571] active:bg-[#DFC561]
            disabled:font-normal disabled:border-1 disabled:shadow-none disabled:border-gray-500 disabled:bg-gray-300 disabled:text-gray-400
            shadow shadow-black p-1 rounded border border-black"
            disabled={postURLState.length == 0}
          >
            {postURLState.length > 0 ?
              <Link href={postURLState} rel="noopener noreferrer" target="_blank">
                {postLinkButtonText}
              </Link>
              :
              <div>{postLinkButtonText}</div>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

export default HistoryView;
