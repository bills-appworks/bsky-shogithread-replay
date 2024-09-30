import { ResultDisplayState, SpecifiedOption, convertShogithreadToKI2, convertShogithreadToKIF, notoSansJP } from '@/app/lib/common';
import { ParsedInfo } from '@/app/lib/bsky';

const Export = ({ parsedInfoState, setResultDisplayState, resultDisplayState, setSpecifiedOptionState, specifiedOptionState }:
  {
    parsedInfoState: ParsedInfo,
    setResultDisplayState: React.Dispatch<React.SetStateAction<ResultDisplayState>>,
    resultDisplayState: ResultDisplayState,
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
            key={resultDisplayState.dataUSI}
            defaultValue={resultDisplayState.dataUSI}
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
              const text = convertShogithreadToKI2(parsedInfoState, specifiedOptionState.isOutputPlayer, event.target.checked);
              setResultDisplayState({
                historyView: resultDisplayState.historyView,
                dataUSI: resultDisplayState.dataUSI,
                dataKI2: text,
                dataKIF: resultDisplayState.dataKIF,
              });
            }}
          />
          <label htmlFor="comment-ki2">コメント出力</label>
          <textarea
            className={`w-full h-40 rounded border border-black bg-[#FFFFDD] ${notoSansJP.className}`}
            id="kifu-data-ki2"
            name="kifu-data-ki2"
            key={resultDisplayState.dataKI2}
            defaultValue={resultDisplayState.dataKI2}
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
              const text = convertShogithreadToKIF(parsedInfoState, false, specifiedOptionState.isOutputPlayer, event.target.checked, true);
              setResultDisplayState({
                historyView: resultDisplayState.historyView,
                dataUSI: resultDisplayState.dataUSI,
                dataKI2: resultDisplayState.dataKI2,
                dataKIF: text,
              });
            }}
          />
          <label htmlFor="comment-kif">コメント出力</label>
          <textarea
            className={`w-full h-40 rounded border border-black bg-[#FFFFDD] ${notoSansJP.className}`}
            id="kifu-data-kif"
            name="kifu-data-kif"
            key={resultDisplayState.dataKIF}
            defaultValue={resultDisplayState.dataKIF}
            readOnly
          />
        </details>
      </div>
    </div>
  );
}

export default Export;
