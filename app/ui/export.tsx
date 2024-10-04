import { KifuManageState, SpecifiedOption, buildReplayURLParameters, convertShogithreadToKI2, convertShogithreadToKIF, getURLoriginPath, setTextAreaById, notoSansJP } from '@/app/lib/common';
import { ParsedInfo } from '@/app/lib/bsky';

// set...Stateすると再レンダリングでユーザresizeがリセットされるため直接設定
export function setKifuDataUSIText(text: string) {
  setTextAreaById('kifu-data-usi', text);
}

export function setKifuDataKI2Text(text: string) {
  setTextAreaById('kifu-data-ki2', text);
}

export function setKifuDataKIFText(text: string) {
  setTextAreaById('kifu-data-kif', text);
}

const Export = ({ parsedInfoState, setKifuManageState, kifuManageState, setURLState, urlState, setSpecifiedOptionState, specifiedOptionState, }:
  {
    parsedInfoState: ParsedInfo,
    setKifuManageState: React.Dispatch<React.SetStateAction<KifuManageState>>,
    kifuManageState: KifuManageState,
    setURLState: React.Dispatch<React.SetStateAction<string>>,
    urlState: string,
//    setResultDisplayState: React.Dispatch<React.SetStateAction<ResultDisplayState>>,
//    resultDisplayState: ResultDisplayState,
    setSpecifiedOptionState: React.Dispatch<React.SetStateAction<SpecifiedOption>>,
    specifiedOptionState: SpecifiedOption,
  }) => {
    return (
    <div>
      <hr />
      <h2 className="text-lg font-bold">[棋譜データ]</h2>
      <div className="space-y-2">
        <details className="px-2 py-1 rounded border border-gray-500
          bg-[#FFE581] hover:bg-[#EFD571] active:bg-[#DFC561]
          shadow shadow-black
        ">
          <summary>SFEN(USI)形式</summary>
          <textarea
            className={`w-full h-40 rounded border border-black bg-[#FFFFDD] ${notoSansJP.className}`}
            id="kifu-data-usi"
            name="kifu-data-usi"
//            key={resultDisplayState.dataUSI}
//            defaultValue={resultDisplayState.dataUSI}
            readOnly
          />
        </details>
        <details className="px-2 py-1 rounded border border-gray-500
          bg-[#FFE581] hover:bg-[#EFD571] active:bg-[#DFC561]
          shadow shadow-black
        ">
          <summary>KI2形式</summary>
          <input
            type="checkbox"
            id="comment-ki2"
            name="comment-ki2"
            checked={specifiedOptionState.isOutputCommentKI2}
            onChange={(event) => {
              setSpecifiedOptionState({
                isOutputPlayer: specifiedOptionState.isOutputPlayer,
                isOutputCommentKI2: event.target.checked,
                isOutputCommentKIF: specifiedOptionState.isOutputCommentKIF,
              });
              let replayURLParameters = '';
              if (kifuManageState.isBuilt) {
                const text = convertShogithreadToKI2(parsedInfoState, specifiedOptionState.isOutputPlayer, event.target.checked);
                replayURLParameters = buildReplayURLParameters(urlState, null, null, specifiedOptionState.isOutputPlayer, event.target.checked, specifiedOptionState.isOutputCommentKIF, kifuManageState.step.toString(), );
                const replayURL = getURLoriginPath() + replayURLParameters;
//                setResultDisplayState({
//                  dataKIF: resultDisplayState.dataKIF,
//                });
                setKifuDataKI2Text(text);
              }
              history.replaceState(null, '', replayURLParameters);
            }}
          />
          <label htmlFor="comment-ki2">コメント出力</label>
          <textarea
            className={`w-full h-40 rounded border border-black bg-[#FFFFDD] ${notoSansJP.className}`}
            id="kifu-data-ki2"
            name="kifu-data-ki2"
//            key={resultDisplayState.dataKI2}
//            defaultValue={resultDisplayState.dataKI2}
            readOnly
          />
        </details>
        <details className="px-2 py-1 rounded border border-gray-500
          bg-[#FFE581] hover:bg-[#EFD571] active:bg-[#DFC561]
          shadow shadow-black
        ">
          <summary>KIF形式（アルファ版：一部形式未準拠）</summary>
          <input
            type="checkbox"
            id="comment-kif"
            name="comment-kif"
            checked={specifiedOptionState.isOutputCommentKIF}
            onChange={(event) => {
              setSpecifiedOptionState({
                isOutputPlayer: specifiedOptionState.isOutputPlayer,
                isOutputCommentKI2: specifiedOptionState.isOutputCommentKI2,
                isOutputCommentKIF: event.target.checked,
              });
              let replayURLParameters = '';
              if (kifuManageState.isBuilt) {
                const text = convertShogithreadToKIF(parsedInfoState, false, specifiedOptionState.isOutputPlayer, event.target.checked, true);
                replayURLParameters = buildReplayURLParameters(urlState, null, null, specifiedOptionState.isOutputPlayer, specifiedOptionState.isOutputCommentKI2, event.target.checked, kifuManageState.step.toString(), );
                const replayURL = getURLoriginPath() + replayURLParameters;
//                setResultDisplayState({
//                  dataKIF: text,
//                });
                setKifuDataKIFText(text);
              }
              history.replaceState(null, '', replayURLParameters);
            }}
          />
          <label htmlFor="comment-kif">コメント出力</label>
          <textarea
            className={`w-full h-40 rounded border border-black bg-[#FFFFDD] ${notoSansJP.className}`}
            id="kifu-data-kif"
            name="kifu-data-kif"
//            key={resultDisplayState.dataKIF}
//            defaultValue={resultDisplayState.dataKIF}
            readOnly
          />
        </details>
      </div>
    </div>
  );
}

export default Export;
