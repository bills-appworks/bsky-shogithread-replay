/**
 * @author bills-appworks https://bsky.app/profile/did:plc:lfjssqqi6somnb7vhup2jm5w
 * @copyright bills-appworks 2024
 * @license This software is released under the MIT License. http://opensource.org/licenses/mit-license.php
 */
import { setTextAreaById, popCopiedBalloon, notoSansJP } from '@/app/lib/common';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-regular-svg-icons';
import CopyClipboard from '@/app/ui/copy-clipboard';

// テキストエリアの値を状態管理しset...Stateすると再レンダリングでユーザresizeがリセットされるため直接設定
export function setReplayURLText(text: string) {
  setTextAreaById('replay-url', text);
}

const ReplayURL = () => {
  return (
    <div>
      <hr />
      <div className="flex justify-stretch m-1">
        <div>
          <h2 className="text-lg font-bold">[再現URL]</h2>
        </div>
        <CopyClipboard copyTextAreaId="replay-url" copiedBalloonId="copied-balloon-replay-url" />
      </div>
      <textarea
        className={`w-full h-20 rounded border border-black bg-[#FFFFDD] ${notoSansJP.className}`}
        id="replay-url"
        name="replay-url"
        readOnly
      />
    </div>
  );
}

export default ReplayURL;
