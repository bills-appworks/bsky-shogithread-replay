/**
 * @author bills-appworks https://bsky.app/profile/did:plc:lfjssqqi6somnb7vhup2jm5w
 * @copyright bills-appworks 2024
 * @license This software is released under the MIT License. http://opensource.org/licenses/mit-license.php
 */

// Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from "@fortawesome/free-regular-svg-icons";
// 定義参照
import { popCopiedBalloon } from "@/app/lib/common";

/**
 * クリップボードコピーボタンUIコンポーネント
 * @param copyTextAreaId コピー対象テキストエリア要素ID
 * @param copiedBalloonId コピー完了バルーン要素ID
 * @returns クリップボードコピーボタンUIのJSX
 */
const CopyClipboard = ({
  copyTextAreaId,
  copiedBalloonId,
}: {
  copyTextAreaId: string,
  copiedBalloonId: string,
}) => {
  return (
    <div className="flex grow justify-end">
      {/* コピー完了バルーン（デフォルト非表示） */}
      <div
        id={copiedBalloonId}
        className="
          rounded px-2 py-0 text-sm flex items-center text-white bg-[#B3936C] invisible transition-opacity duration-500 delay-1000 relative
          after:absolute before:content-[''] after:top-[0.5em] after:right-[-0.4em] after:p-[0.35em] after:bg-inherit after:border-t-0 after:border-l-0 after:rotate-45
        "
      >
        <span>コピーしました</span>
      </div>
      {/* コピーボタン */}
      <button className="ml-2 px-1 bg-[#FFE581] hover:bg-[#EFD571] active:bg-[#DFC561]
        disabled:font-normal disabled:border-1 disabled:shadow-none disabled:border-gray-500 disabled:bg-gray-300 disabled:text-gray-400
        shadow shadow-black rounded border border-black"
        onClick={(event) => {
          popCopiedBalloon(copyTextAreaId, copiedBalloonId);
        }}
      >
        <div className="flex items-center gap-1">
          コピー
          <FontAwesomeIcon icon={faCopy} className="text-xs"/>
        </div>
      </button>
    </div>
  );
}

export default CopyClipboard;
