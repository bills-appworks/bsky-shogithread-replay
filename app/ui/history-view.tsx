/**
 * @author bills-appworks https://bsky.app/profile/did:plc:lfjssqqi6somnb7vhup2jm5w
 * @copyright bills-appworks 2024
 * @license This software is released under the MIT License. http://opensource.org/licenses/mit-license.php
 */

// Next.js
import Link from "next/link";
// Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
// 定義参照
import { setTextAreaById, notoSansJP } from '@/app/lib/common';
import CopyClipboard from '@/app/ui/copy-clipboard';

const postLinkButtonText = 'リプレイ中の現在指し手ポストをBlueskyで開く';

/**
 * テキストエリアの値を状態管理しset...Stateすると再レンダリングでユーザresizeがリセットされるため直接設定
 * @param text スレッド一覧テキストエリアに設定するテキスト
 */
export function setHistoryViewText(text: string) {
  setTextAreaById('history-view', text);
}

/**
 * スレッド一覧部分UIコンポーネント
 * @param postURLState Blueskyで開く指し手ポストURL管理State
 * @returns スレッド一覧部分UIのJSX
 */
const HistoryView = ({ postURLState, }: { postURLState: string, }) => {
  return (
    <div className="flex flex-col">
      <hr />
      <div className="space-y">
        <div className="flex justify-stretch m-1">
          <div>
            <h2 className="text-lg font-bold">[スレッド一覧]</h2>
          </div>
          <CopyClipboard copyTextAreaId="history-view" copiedBalloonId="copied-balloon-history-view" />
        </div>
        <textarea
          className={`w-full h-20 rounded border border-black bg-[#FFFFDD] ${notoSansJP.className}`}
          id="history-view"
          name="history-view"
          readOnly
        />
        <div className="flex justify-center">
          <button className="ml-2 bg-[#FFE581] hover:bg-[#EFD571] active:bg-[#DFC561]
            disabled:font-normal disabled:border-1 disabled:shadow-none disabled:border-gray-500 disabled:bg-gray-300 disabled:text-gray-400
            shadow shadow-black p-1 rounded border border-black"
            disabled={postURLState.length == 0}
          >
            {/* Blueskyで開く指し手ポストURLが有効な場合のみLinkコンポーネント生成 */}
            {postURLState.length > 0 ?
              <Link href={postURLState} rel="noopener noreferrer" target="_blank">
                <span className="inline-flex items-center gap-1">
                  {postLinkButtonText}{' '}
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs" />
                </span>
              </Link>
              :
              <span className="inline-flex items-center gap-1">
                {postLinkButtonText}{' '}
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs" />
              </span>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

export default HistoryView;
