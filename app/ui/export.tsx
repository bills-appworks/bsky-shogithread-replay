import { ResultDisplayState, notoSansJP } from '@/app/lib/common';

const Export = ({ resultDisplayState }: {resultDisplayState:  ResultDisplayState }) => {
    return (
    <div>
      <hr />
      <h2 className="text-lg font-bold">[棋譜データ]</h2>
      <div className="space-y-2">
        <details className="px-2 py-1 rounded border border-gray-500
          bg-[#FFE581] hover:bg-[#EFD571] active:bg-[#DFC561]
          shadow shadow-black
        ">
          <summary>USI形式</summary>
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
          <summary>KIF形式</summary>
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
