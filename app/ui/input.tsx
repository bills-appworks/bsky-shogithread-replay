'use client';

// React
import React from 'react';
// Next.js
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
// 定義参照
import { ParsedInfo, ShogithreadUrlPlaceholder, queryShogithread} from '@/app/lib/bsky';
//import { KifuStoreState, ResultDisplayState, SpecifiedOption } from '@/app/lib/common';
import { KifuStoreState, KifuManageState, ResultDisplayState, SpecifiedOption, initialParsedInfo, initialKifuStore, initialKifuManageState, initialURLState, initialResultDisplayState, initialSpecifiedOption, initialDialogBoxState, convertShogithreadToKI2, convertShogithreadToHistoryView, convertShogithreadToKIF } from '@/app/lib/common';
import { DialogBoxState } from '@/app/ui/dialog-box';
import { KifuStore } from 'kifu-for-js';

const Input = ({
  setParsedInfoState, parsedInfoState,
  setKifuStoreState, kifuStoreState,
  setKifuManageState, kifuManageState,
  setURLState, urlState,
  setResultDisplayState, resultDisplayState,
  setSpecifiedOptionState, specifiedOptionState,
  setDialogBoxState, dialogBoxState,
}: {
  setParsedInfoState: React.Dispatch<React.SetStateAction<ParsedInfo>>, parsedInfoState: ParsedInfo,
  setKifuStoreState: React.Dispatch<React.SetStateAction<KifuStoreState>>, kifuStoreState: KifuStoreState,
  setKifuManageState: React.Dispatch<React.SetStateAction<KifuManageState>>, kifuManageState: KifuManageState,
  setURLState: React.Dispatch<React.SetStateAction<string>>, urlState: string,
  setResultDisplayState: React.Dispatch<React.SetStateAction<ResultDisplayState>>, resultDisplayState: ResultDisplayState,
  setSpecifiedOptionState: React.Dispatch<React.SetStateAction<SpecifiedOption>>, specifiedOptionState: SpecifiedOption,
  setDialogBoxState: React.Dispatch<React.SetStateAction<DialogBoxState>>, dialogBoxState: DialogBoxState,
}) => {
/*
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try{
      // event.target型解決
      // https://zenn.dev/kage1020/scraps/beec58cd5a3df9
      const formData = new FormData(event.target as HTMLFormElement);
      const [parsedInfo, kifuText, historyViewText, dataUSI, dataKI2, dataKIF] = await queryShogithread(formData, specifiedOptionState);
      setParsedInfoState(parsedInfo);
      setKifuStoreState({ kifuStore: new KifuStore({ kifu: kifuText })});
      setResultDisplayState({
        historyView: historyViewText,
        dataUSI: dataUSI,
        dataKI2: dataKI2,
        dataKIF: dataKIF,
      });
    } catch(e: unknown) {
      if (e instanceof Error) {
        setDialogBoxState({ isOpen: true, textTitle: dialogBoxState.textTitle, textBody: e.message});
      }
    }
  }
*/

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    params.set('url', urlState);
    params.set('player', specifiedOptionState.isOutputPlayer ? 'true' : 'false');
    params.set('KI2-comment', specifiedOptionState.isOutputCommentKI2 ? 'true' : 'false');
    params.set('KIF-comment', specifiedOptionState.isOutputCommentKIF ? 'true' : 'false');
    replace(`${pathname}?${params.toString()}`);
  }

  const onChangeOutputPlayer = (isOutputPlayer: boolean) => {
    if (kifuManageState.isBuilt) {
      const step: number = kifuStoreState.kifuStore.player.tesuu;
      const kifuText = convertShogithreadToKI2(parsedInfoState, isOutputPlayer, true);
      const kifuStore = new KifuStore({ kifu: kifuText });
      setKifuStoreState({ kifuStore: kifuStore});
      kifuStore.player.goto(step);
      const historyView = convertShogithreadToHistoryView(parsedInfoState, isOutputPlayer);
      const dataUSI = resultDisplayState.dataUSI;
      const dataKI2 = convertShogithreadToKI2(parsedInfoState, isOutputPlayer, specifiedOptionState.isOutputCommentKI2);
      const dataKIF = convertShogithreadToKIF(parsedInfoState, false, isOutputPlayer, specifiedOptionState.isOutputCommentKIF, true);
      setResultDisplayState({ historyView: historyView, dataUSI: dataUSI, dataKI2: dataKI2, dataKIF: dataKIF });
    }
    setSpecifiedOptionState({
      isOutputPlayer: isOutputPlayer,
      isOutputCommentKI2: specifiedOptionState.isOutputCommentKI2,
      isOutputCommentKIF: specifiedOptionState.isOutputCommentKIF,
    });
  }

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
              //key={urlState}
              //defaultValue={urlState}
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
                  /*
                  setSpecifiedOptionState({
                    isOutputPlayer: event.target.checked,
                    isOutputCommentKI2: specifiedOptionState.isOutputCommentKI2,
                    isOutputCommentKIF: specifiedOptionState.isOutputCommentKIF,
                  });
                  */
                  onChangeOutputPlayer(event.target.checked);
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
                /*
                setKifuStoreState({ kifuStore: new KifuStore({ kifu: "" })});
                setURLState("");
                setResultDisplayState({ historyView: "", dataUSI: "", dataKI2: "", dataKIF: "", });
                setSpecifiedOptionState({ isOutput});
                */
                setParsedInfoState(initialParsedInfo);
                setKifuStoreState(initialKifuStore);
                setKifuManageState(initialKifuManageState);
                setURLState(initialURLState);
                setResultDisplayState(initialResultDisplayState);
                setSpecifiedOptionState(initialSpecifiedOption);
                const params = new URLSearchParams();
                replace(`${pathname}?${params.toString()}`);
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