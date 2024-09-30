'use client';

import { ParsedInfo, ShogithreadUrlPlaceholder, queryShogithread} from '@/app/lib/bsky';
import { KifuStoreState, ResultDisplayState, SpecifiedOption } from '@/app/lib/common';
import React from 'react';
import { KifuStore } from 'kifu-for-js';

const Input = (
  { setParsedInfoState, parsedInfoState,
    setKifuStoreState, kifuStoreState,
    setURLState, urlState,
    setResultDisplayState, resultDisplayState,
    setSpecifiedOptionState, specifiedOptionState,
  }: {
    setParsedInfoState: React.Dispatch<React.SetStateAction<ParsedInfo>>, parsedInfoState: ParsedInfo,
    setKifuStoreState: React.Dispatch<React.SetStateAction<KifuStoreState>>, kifuStoreState: KifuStoreState,
    setURLState: React.Dispatch<React.SetStateAction<string>>, urlState: string,
    setResultDisplayState: React.Dispatch<React.SetStateAction<ResultDisplayState>>, resultDisplayState: ResultDisplayState,
    setSpecifiedOptionState: React.Dispatch<React.SetStateAction<SpecifiedOption>>, specifiedOptionState: SpecifiedOption,
  }) => {
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // event.target型解決
    // https://zenn.dev/kage1020/scraps/beec58cd5a3df9
    const formData = new FormData(event.target as HTMLFormElement);
    const [parsedInfo, kifuText, historyViewText, dataUSI, dataKI2, dataKIF ] = await queryShogithread(formData, specifiedOptionState);
    setParsedInfoState(parsedInfo);
    setKifuStoreState({ kifuStore: new KifuStore({ kifu: kifuText })});
    setResultDisplayState({
      historyView: historyViewText,
      dataUSI: dataUSI,
      dataKI2: dataKI2,
      dataKIF: dataKIF,
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="space-y-1">
          <div>
            <div className="flex justify-center"><span className="font-bold">将棋thread対局URLを入力</span> (対局スレッドの最終指し手ポスト)</div>
          </div>
          <div className="flex justify-center">
            <input
              className="w-full rounded border-2 border-black bg-[#FFFFDD] font-sans"
              id="url"
              name="url"
              type="url"
              placeholder={ShogithreadUrlPlaceholder}
  // 状態管理(onChange=>setState)でkey/defaultValueは競合するのでvalue
  //            key={urlState}
  //            defaultValue={urlState}
              value={urlState}
              onChange={(event) => { 
                setURLState(event.target.value);
              }}
            />
          </div>
          <div className="flex justify-center">
            <div className="self-center">
              <input
                type="checkbox"
                id="player-output"
                name="player-output"
                checked={specifiedOptionState.isOutputPlayer}
                onChange={(event) => {
                  setSpecifiedOptionState({
                    isOutputPlayer: event.target.checked,
                    isOutputCommentKI2: specifiedOptionState.isOutputCommentKI2,
                    isOutputCommentKIF: specifiedOptionState.isOutputCommentKIF,
                  });
                }}
              />
              <label className="self-center" htmlFor="player-output">プレイヤー名出力</label>
            </div>
            <button className="ml-2 bg-[#FFE581] hover:bg-[#EFD571] active:bg-[#DFC561]
              disabled:font-normal disabled:border-1 disabled:shadow-none disabled:border-gray-500 disabled:bg-gray-300 disabled:text-gray-400
              shadow shadow-black font-bold p-1 rounded border-2 border-black"
              disabled={urlState.length == 0}
              type="submit"
            >
              棋譜リプレイ
            </button>
            <button className="ml-2 bg-[#FFE581] hover:bg-[#EFD571] active:bg-[#DFC561]
              shadow shadow-black p-1 rounded border border-black" type="reset"
              onClick={(event) => {
                setKifuStoreState({ kifuStore: new KifuStore({ kifu: "" })});
                setURLState("");
                setResultDisplayState({ historyView: "", dataUSI: "", dataKI2: "", dataKIF: "", });
              }}
            >
              リセット
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Input;