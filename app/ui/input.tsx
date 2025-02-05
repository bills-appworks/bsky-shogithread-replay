/**
 * @author bills-appworks https://bsky.app/profile/did:plc:lfjssqqi6somnb7vhup2jm5w
 * @copyright bills-appworks 2024
 * @license This software is released under the MIT License. http://opensource.org/licenses/mit-license.php
 */
'use client';

// React
import React, { useEffect, useRef } from 'react';
// Next.js
import { usePathname, useRouter } from 'next/navigation';
// 定義参照
import { ParsedInfo, ShogithreadUrlPlaceholder, buildPostURL } from '@/app/lib/bsky';
import { KifuStoreState, KifuManageState, SpecifiedOption, initialParsedInfo, initialKifuStore, initialKifuManageState, initialURLState, initialSpecifiedOption, initialDialogBoxState, buildReplayURLParameters, getURLoriginPath, initialPostURLState } from '@/app/lib/common';
import { convertShogithreadToHistoryView, convertShogithreadToKI2, convertShogithreadToKIF } from '@/app/lib/convert';
import { setReplayURLText } from '@/app/ui/replay-url';
import { KifuStore } from 'kifu-for-js';
import { setHistoryViewText } from './history-view';
import { setKifuDataKI2Text, setKifuDataKIFText, setKifuDataUSIText } from '@/app/ui/export';

/**
 * ユーザ入力部分UIコンポーネント
 * @param setParsedInfoState 棋譜スレッド解析情報State setter
 * @param parsedInfoState 棋譜スレッド解析情報State
 * @param setKifuStoreState Kifu for JS KifuStoreオブジェクトState setter
 * @param kifuStoreState Kifu for JS KifuStoreオブジェクトState
 * @param setKifuManageState 棋譜再生情報管理State setter
 * @param kifuManageState 棋譜再生情報管理State
 * @param setURLState 将棋thread対局URL State setter
 * @param urlState 将棋thread対局URL State
 * @param setPostURLState リプレイ中現在指し手ポストState setter
 * @param postURLState リプレイ中現在指し手ポストState
 * @param setSpecifiedOptionState オプション指定管理State setter
 * @param specifiedOptionState オプション指定管理State
 * @param isDebug デバッグモード
 * @returns 
 */
const Input = ({
  setParsedInfoState, parsedInfoState,
  setKifuStoreState, kifuStoreState,
  setKifuManageState, kifuManageState,
  setURLState, urlState,
  setPostURLState, postURLState,
  setSpecifiedOptionState, specifiedOptionState,
  isDebug,
}: {
  setParsedInfoState: React.Dispatch<React.SetStateAction<ParsedInfo>>, parsedInfoState: ParsedInfo,
  setKifuStoreState: React.Dispatch<React.SetStateAction<KifuStoreState>>, kifuStoreState: KifuStoreState,
  setKifuManageState: React.Dispatch<React.SetStateAction<KifuManageState>>, kifuManageState: KifuManageState,
  setURLState: React.Dispatch<React.SetStateAction<string>>, urlState: string,
  setPostURLState: React.Dispatch<React.SetStateAction<string>>, postURLState: string,
  setSpecifiedOptionState: React.Dispatch<React.SetStateAction<SpecifiedOption>>, specifiedOptionState: SpecifiedOption,
  isDebug: boolean,
}) => {
  // イベントリスナー内で参照するため
  const parsedInfoRef = useRef(parsedInfoState);
  parsedInfoRef.current = parsedInfoState;
  const kifuStoreRef = useRef(kifuStoreState);
  kifuStoreRef.current = kifuStoreState;
  const kifuManageRef = useRef(kifuManageState);
  kifuManageRef.current = kifuManageState;
  const urlRef = useRef(urlState);
  urlRef.current = urlState;
  const specifiedOptionRef = useRef(specifiedOptionState);
  specifiedOptionRef.current = specifiedOptionState;
  const postURLRef = useRef(postURLState);
  postURLRef.current = postURLState;

  const pathname = usePathname();
  const { replace } = useRouter();

  /**
   * フォームsubmitハンドラ
   * @param event フォームsubmitイベントオブジェクト
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // URL・オプション指定状態に応じてクエリパラメタを構成
    const params = new URLSearchParams();
    params.set('url', urlState);
    params.set('player', specifiedOptionState.isOutputPlayer ? 'true' : 'false');
    params.set('KI2-comment', specifiedOptionState.isOutputCommentKI2 ? 'true' : 'false');
    params.set('KIF-comment', specifiedOptionState.isOutputCommentKIF ? 'true' : 'false');
    replace(`${pathname}?${params.toString()}`);
  }

  /**
   * プレイヤー名出力指定変更時に関連出力設定
   * @param isOutputPlayer プレイヤー名出力指定（true：チェック状態）
   */
  const onChangeOutputPlayer = (isOutputPlayer: boolean) => {
    let replayURLParameters = '';
    if (kifuManageState.isBuilt) {  // 棋譜スレッドfetchして解析情報構築済の場合
      const step: number = kifuStoreState.kifuStore.player.tesuu;
      // 棋譜再生盤面、スレッド一覧、棋譜データのプレイヤー名表示を更新するため再設定
      const kifuText = convertShogithreadToKI2(parsedInfoState, isOutputPlayer, true);
      const kifuStore = new KifuStore({ kifu: kifuText });
      setKifuStoreState({ kifuStore: kifuStore});
      kifuStore.player.goto(step);
      replayURLParameters = buildReplayURLParameters(urlState, null, isOutputPlayer, specifiedOptionState.isOutputCommentKI2, specifiedOptionState.isOutputCommentKIF, step ? step.toString() : null);
      const replayURL = getURLoriginPath() + replayURLParameters;
      const historyView = convertShogithreadToHistoryView(parsedInfoState, isOutputPlayer);
      const dataKI2 = convertShogithreadToKI2(parsedInfoState, isOutputPlayer, specifiedOptionState.isOutputCommentKI2);
      const dataKIF = convertShogithreadToKIF(parsedInfoState, false, isOutputPlayer, specifiedOptionState.isOutputCommentKIF, true, isDebug);
      setReplayURLText(replayURL);
      setHistoryViewText(historyView);
      // SFEN(USI)はプレイヤー表示なしのため対応不要
      //setKifuDataUSIText(...);
      setKifuDataKI2Text(dataKI2);
      setKifuDataKIFText(dataKIF);
    }
    // プレイヤー名出力指定をオプション指定管理Stateに反映（他オプションは現状維持）
    setSpecifiedOptionState({
      isOutputPlayer: isOutputPlayer,
      isOutputCommentKI2: specifiedOptionState.isOutputCommentKI2,
      isOutputCommentKIF: specifiedOptionState.isOutputCommentKIF,
    });
    // Webブラウザアドレスバークエリパラメタ更新（再現URLに同期）
    history.replaceState(history.state, '', replayURLParameters);
  }

  /**
   * Kifu for JSの棋譜履歴スクロールイベントハンドラ
   * 選択中の手数に応じて再現URLやWebブラウザアドレスバーのクエリパラメタを同期
   */
  const onScrollKifu = () => {
    if (kifuManageRef.current.isBuilt) {  // 棋譜スレッドfetchして解析情報構築済の場合
      const step: number = kifuStoreRef.current.kifuStore.player.tesuu;
      // 棋譜情報管理Stateをref経由で更新
      kifuManageRef.current = {isBuilt: kifuManageRef.current.isBuilt, step: step, };
      const replayURLParameters: string = buildReplayURLParameters(
        urlRef.current,
        null,
        specifiedOptionRef.current.isOutputPlayer,
        specifiedOptionRef.current.isOutputCommentKI2,
        specifiedOptionRef.current.isOutputCommentKIF,
        step ? step.toString() : null
      );
      const replayURL: string = getURLoriginPath() + replayURLParameters;
      const postURL: string = buildPostURL(parsedInfoRef.current, step);
      // history.replaceStateでhistory.stateを渡すとset...Stateしないと変更部分が反映されない
      // ただしset...Stateすると再レンダリングでユーザresizeがリセットされるため直接設定
      setReplayURLText(replayURL);
      setPostURLState(postURL);
      // history.stateを渡さないとKifu for JSでボタン押しっぱなしによる自動再生が動作しない
      history.replaceState(history.state, '', replayURLParameters);
    }
  };

  // コンポーネントレンダリング後にKifu for JSの棋譜履歴スクロールイベントハンドラをバインド
  // アンマウント時にバインドを解除しておく必要あり
  useEffect(() => {
    document.getElementsByClassName('kifuforjs-kifulist')[0].addEventListener("scroll", onScrollKifu);
    return () => document.getElementsByClassName('kifuforjs-kifulist')[0].removeEventListener("scroll", onScrollKifu);
  }, [kifuStoreState, kifuManageState, urlState, specifiedOptionState]);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="space-y-1">
          {/* 将棋thread対局URL入力欄 */}
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
              // 状態管理(onChange=>setState)でkey/defaultValueは競合するのでvalueで指定
              //key={urlState}
              //defaultValue={urlState}
              value={urlState}
              onChange={(event) => {
                setURLState(event.target.value);
              }}
            />
          </div>
          <div className="flex justify-center">
            {/* プレイヤー名出力チェックボックス */}
            <div className="self-center">
              <input
                type="checkbox"
                id="player-output"
                name="player-output"
                checked={specifiedOptionState.isOutputPlayer}
                onChange={(event) => {
                  onChangeOutputPlayer(event.target.checked);
                }}
              />
              <label className="self-center" htmlFor="player-output">プレイヤー名出力</label>
            </div>
            {/* 棋譜リプレイボタン */}
            <button className="ml-2 bg-[#FFE581] hover:bg-[#EFD571] active:bg-[#DFC561]
              disabled:font-normal disabled:border-1 disabled:shadow-none disabled:border-gray-500 disabled:bg-gray-300 disabled:text-gray-400
              shadow shadow-black font-bold p-1 rounded border-2 border-black"
              disabled={urlState.length == 0}
              type="submit"
            >
              棋譜リプレイ
            </button>
            {/* リセットボタン */}
            <button className="ml-2 bg-[#FFE581] hover:bg-[#EFD571] active:bg-[#DFC561]
              shadow shadow-black p-1 rounded border border-black" type="reset"
              onClick={(event) => {
                setParsedInfoState(initialParsedInfo);
                setKifuStoreState(initialKifuStore);
                setKifuManageState(initialKifuManageState);
                setURLState(initialURLState);
                setReplayURLText('');
                setHistoryViewText('');
                setPostURLState(initialPostURLState);
                setKifuDataUSIText('');
                setKifuDataKI2Text('');
                setKifuDataKIFText('');
                setSpecifiedOptionState(initialSpecifiedOption);
                history.replaceState(null, '', '/');
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
