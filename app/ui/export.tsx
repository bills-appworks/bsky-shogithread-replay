/**
 * @author bills-appworks https://bsky.app/profile/did:plc:lfjssqqi6somnb7vhup2jm5w
 * @copyright bills-appworks 2024
 * @license This software is released under the MIT License. http://opensource.org/licenses/mit-license.php
 */

// 定義参照
import {
  KifuManageState,
  SpecifiedOption,
  buildReplayURLParameters,
  getURLoriginPath,
  setTextAreaById,
  notoSansJP
} from '@/app/lib/common';
import { convertShogithreadToKI2, convertShogithreadToKIF } from '@/app/lib/convert';
import { ParsedInfo } from '@/app/lib/bsky';
import { setReplayURLText } from '@/app/ui/replay-url';
import CopyClipboard from '@/app/ui/copy-clipboard';

/**
 * テキストエリアの値を状態管理しset...Stateすると再レンダリングでユーザresizeがリセットされるため直接設定
 * @param text SFEN(USI)テキストエリアに設定するテキスト
 */
export function setKifuDataUSIText(text: string) {
  setTextAreaById('kifu-data-usi', text);
}

/**
 * テキストエリアの値を状態管理しset...Stateすると再レンダリングでユーザresizeがリセットされるため直接設定
 * @param text KI2テキストエリアに設定するテキスト
 */
export function setKifuDataKI2Text(text: string) {
  setTextAreaById('kifu-data-ki2', text);
}

/**
 * テキストエリアの値を状態管理しset...Stateすると再レンダリングでユーザresizeがリセットされるため直接設定
 * @param text KIFテキストエリアに設定するテキスト
 */
export function setKifuDataKIFText(text: string) {
  setTextAreaById('kifu-data-kif', text);
}

/**
 * 棋譜データ部分UIコンポーネント
 * @param parsedInfoState 棋譜スレッド解析情報State
 * @param kifuManageState 棋譜再生情報管理State
 * @param urlState 将棋thread対局URL State
 * @param setSpecifiedOptionState オプション指定管理State setter
 * @param specifiedOptionState オプション指定管理State
 * @param isDebug デバッグモード
 * @returns 棋譜データ部分UIのJSX
 */
const Export = ({
  parsedInfoState,
  kifuManageState,
  urlState,
  setSpecifiedOptionState,
  specifiedOptionState,
  isDebug,
}: {
  parsedInfoState: ParsedInfo,
  kifuManageState: KifuManageState,
  urlState: string,
  setSpecifiedOptionState: React.Dispatch<React.SetStateAction<SpecifiedOption>>,
  specifiedOptionState: SpecifiedOption,
  isDebug: boolean,
}) => {
  return (
    <div>
      <hr />
      <h2 className="text-lg font-bold">[棋譜データ]</h2>
      <div className="space-y-2">
        <details className="space-y-2 px-2 py-1 rounded border border-gray-500
          bg-[#FFE581] hover:bg-[#EFD571] active:bg-[#DFC561]
          shadow shadow-black
        ">
          <summary>SFEN(USI)形式</summary>
          <div className="flex justify-stretch m-1">
            <CopyClipboard copyTextAreaId="kifu-data-usi" copiedBalloonId="copied-balloon-kifu-data-usi" />
          </div>
          <textarea
            className={`w-full h-40 rounded border border-black bg-[#FFFFDD] ${notoSansJP.className}`}
            id="kifu-data-usi"
            name="kifu-data-usi"
            readOnly
          />
        </details>
        <details className="px-2 py-1 rounded border border-gray-500
          bg-[#FFE581] hover:bg-[#EFD571] active:bg-[#DFC561]
          shadow shadow-black
        ">
          <summary>KI2形式</summary>
          <div className="flex justify-stretch m-1">
            {/* コメント出力チェックボックス */}
            <input
              type="checkbox"
              id="comment-ki2"
              name="comment-ki2"
              checked={specifiedOptionState.isOutputCommentKI2}
              onChange={(event) => {
                // KI2コメント出力指定をオプション指定管理Stateに反映（他オプションは現状維持）
                setSpecifiedOptionState({
                  isOutputPlayer: specifiedOptionState.isOutputPlayer,
                  isOutputCommentKI2: event.target.checked,
                  isOutputCommentKIF: specifiedOptionState.isOutputCommentKIF,
                });
                let replayURLParameters = '';
                if (kifuManageState.isBuilt) {  // 棋譜スレッドfetchして解析情報構築済の場合
                  const text = convertShogithreadToKI2(parsedInfoState, specifiedOptionState.isOutputPlayer, event.target.checked);
                  replayURLParameters = buildReplayURLParameters(urlState, null, specifiedOptionState.isOutputPlayer, event.target.checked, specifiedOptionState.isOutputCommentKIF, kifuManageState.step.toString(), );
                  const replayURL = getURLoriginPath() + replayURLParameters;
                  setReplayURLText(replayURL);
                  setKifuDataKI2Text(text);
                }
                // Webブラウザアドレスバークエリパラメタ更新（再現URLに同期）
                // history.stateを指定しないと再レンダリングが行われる
                history.replaceState(history.state, '', replayURLParameters);
              }}
            />
            <label htmlFor="comment-ki2">コメント出力</label>
            <CopyClipboard copyTextAreaId="kifu-data-ki2" copiedBalloonId="copied-balloon-kifu-data-ki2" />
          </div>
          <textarea
            className={`w-full h-40 rounded border border-black bg-[#FFFFDD] ${notoSansJP.className}`}
            id="kifu-data-ki2"
            name="kifu-data-ki2"
            readOnly
          />
        </details>
        <details className="px-2 py-1 rounded border border-gray-500
          bg-[#FFE581] hover:bg-[#EFD571] active:bg-[#DFC561]
          shadow shadow-black
        ">
          <summary>KIF形式（アルファ版：一部形式未準拠）</summary>
          <div className="flex justify-stretch m-1">
            {/* コメント出力チェックボックス */}
            <input
              type="checkbox"
              id="comment-kif"
              name="comment-kif"
              checked={specifiedOptionState.isOutputCommentKIF}
              onChange={(event) => {
                // KIFコメント出力指定をオプション指定管理Stateに反映（他オプションは現状維持）
                setSpecifiedOptionState({
                  isOutputPlayer: specifiedOptionState.isOutputPlayer,
                  isOutputCommentKI2: specifiedOptionState.isOutputCommentKI2,
                  isOutputCommentKIF: event.target.checked,
                });
                let replayURLParameters = '';
                if (kifuManageState.isBuilt) {  // 棋譜スレッドfetchして解析情報構築済の場合
                  const text = convertShogithreadToKIF(parsedInfoState, false, specifiedOptionState.isOutputPlayer, event.target.checked, true, isDebug);
                  replayURLParameters = buildReplayURLParameters(urlState, null, specifiedOptionState.isOutputPlayer, specifiedOptionState.isOutputCommentKI2, event.target.checked, kifuManageState.step.toString(), );
                  const replayURL = getURLoriginPath() + replayURLParameters;
                  setReplayURLText(replayURL);
                  setKifuDataKIFText(text);
                }
                // Webブラウザアドレスバークエリパラメタ更新（再現URLに同期）
                // history.stateを指定しないと再レンダリングが行われる
                history.replaceState(history.state, '', replayURLParameters);
              }}
            />
            <label htmlFor="comment-kif">コメント出力</label>
            <CopyClipboard copyTextAreaId="kifu-data-kif" copiedBalloonId="copied-balloon-kifu-data-kif" />
          </div>
          <textarea
            className={`w-full h-40 rounded border border-black bg-[#FFFFDD] ${notoSansJP.className}`}
            id="kifu-data-kif"
            name="kifu-data-kif"
            readOnly
          />
        </details>
      </div>
    </div>
  );
}

export default Export;
