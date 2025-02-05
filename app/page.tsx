/**
 * @author bills-appworks https://bsky.app/profile/did:plc:lfjssqqi6somnb7vhup2jm5w
 * @copyright bills-appworks 2024
 * @license This software is released under the MIT License. http://opensource.org/licenses/mit-license.php
 */
'use client';

// React
import React, { useState, useEffect, Suspense } from "react";
// Next.js
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from 'next/navigation';
// Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBluesky } from '@fortawesome/free-brands-svg-icons';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
// アプリ内UIコンポーネント
import Input from '@/app/ui/input';
import KifuForJS from '@/app/ui/kifu-for-js';
import ReplayURL, { setReplayURLText } from '@/app/ui/replay-url';
import HistoryView, { setHistoryViewText } from '@/app/ui/history-view';
import Export, { setKifuDataKI2Text, setKifuDataKIFText, setKifuDataUSIText } from '@/app/ui/export';
import PrivacyPolicy from '@/app/ui/privacy-policy';
import DialogBox from '@/app/ui/dialog-box';
import NowLoading from '@/app/ui/now-loading';
// 定義参照
import {
  buildShogithreadInfo,
  initialParsedInfo,
  initialKifuStore,
  initialKifuManageState,
  initialURLState,
  initialPostURLState,
  initialSpecifiedOption,
  initialDialogBoxState,
  initialNowLoadingState,
} from '@/app/lib/common';
import { convertATURItoURL, ParsedInfo } from "@/app/lib/bsky";

/**
 * ページ全体コンポーネント
 * @returns ページJSX
 */
export default function Home() {
  // コンポーネント間の状態を共有するためここで状態管理
  const [ parsedInfoState, setParsedInfoState ] = useState(initialParsedInfo);
  const [ kifuStoreState, setKifuStoreState ] = useState(initialKifuStore);
  const [ kifuManageState, setKifuManageState ] = useState(initialKifuManageState);
  const [ urlState, setURLState ] = useState(initialURLState);
  const [ postURLState, setPostURLState ] = useState(initialPostURLState);
  const [ specifiedOptionState, setSpecifiedOptionState ] = useState(initialSpecifiedOption);
  const [ dialogBoxState, setDialogBoxState ] = useState(initialDialogBoxState);
  const [ nowLoadingState, setNowLoadingState ] = useState(initialNowLoadingState);

  // URLクエリパラメタ処理
  const searchParams = useSearchParams();
  const url = searchParams.get('url');
  const atUri = searchParams.get('at-uri');
  const isOutputPlayer = searchParams.get('player') != 'false';
  const isOutputCommentKI2 = searchParams.get('KI2-comment') != 'false';
  const isOutputCommentKIF = searchParams.get('KIF-comment') != 'false';
  const step = searchParams.get('step');
  const isDebug = searchParams.get('debug') == 'true';

  /**
   * クエリパラメタにURL/profile/record idが指定されて場合にBlueskyへfetchして状態・画面に反映
   * @param url クエリパラメタ指定urlの値
   * @param atUri クエリパラメタ指定at-uriの値
   * @param isOutputPlayer クエリパラメタ指定playerの値
   * @param isOutputCommentKI2 クエリパラメタ指定KI2-commentの値
   * @param isOutputCommentKIF クエリパラメタ指定KIF-commentの値
   * @param step  クエリパラメタ指定stepの値
   * @param isDebug クエリパラメタ指定debugの値
   */
  const procedureQueryParameter = async (url: string | null, atUri: string | null, isOutputPlayer: boolean, isOutputCommentKI2: boolean, isOutputCommentKIF: boolean, step: string | null, isDebug: boolean) => {
    try {
      // NOW LOADING...
      setNowLoadingState({ isOpen: true, textTitle: nowLoadingState.textTitle, textBody: 'Blueskyから将棋threadデータを取得しています' });
      // クエリパラメタに対応するスレッドから解析情報構築
      const [parsedInfo, kifuStore, replayURLText, historyViewText, postURLState, dataUSI, dataKI2, dataKIF]:
        [
          parsedInfo: ParsedInfo,
          kifuStore: any,
          replayURLText: string,
          historyViewText: string,
          postURLState: string,
          dataUSI: string,
          dataKI2: string,
          dataKIF: string
        ] = await buildShogithreadInfo(url, atUri, isOutputPlayer, isOutputCommentKI2, isOutputCommentKIF, step, isDebug);
      setParsedInfoState(parsedInfo);
      // stepパラメタが指定されている場合は指定手数にシフト
      if (step) {
        kifuStore.player.goto(parseInt(step));
      }
      // 各種状態管理に反映
      setKifuStoreState({ kifuStore: kifuStore});
      setKifuManageState({ isBuilt: true, step: step ? parseInt(step) : 0, });
      setURLState(url ? url : convertATURItoURL(atUri ? atUri : '', undefined));
      setReplayURLText(replayURLText);
      setHistoryViewText(historyViewText);
      setPostURLState(postURLState);
      setKifuDataUSIText(dataUSI);
      setKifuDataKI2Text(dataKI2);
      setKifuDataKIFText(dataKIF);
      setSpecifiedOptionState({ isOutputPlayer: isOutputPlayer, isOutputCommentKI2: isOutputCommentKI2, isOutputCommentKIF: isOutputCommentKIF, })
      setNowLoadingState({ isOpen: false, textTitle: nowLoadingState.textTitle, textBody: nowLoadingState.textBody });
    } catch(e: unknown) {
      if (e instanceof Error) {
        setParsedInfoState(initialParsedInfo);
        setKifuStoreState(initialKifuStore);
        setKifuManageState(initialKifuManageState);
        // setURLState() URLは指定時のものを維持
        setReplayURLText('');
        setHistoryViewText('');
        setPostURLState(initialPostURLState);
        setKifuDataUSIText('');
        setKifuDataKI2Text('');
        setKifuDataKIFText('');
        // setSpecifiedOptionState() オプション指定は維持
        setNowLoadingState({ isOpen: false, textTitle: nowLoadingState.textTitle, textBody: nowLoadingState.textBody });
        setDialogBoxState({ isOpen: true, textTitle: dialogBoxState.textTitle, textBody: e.message});
      }
    }
  };

  // コンポーネントレンダリング後にクエリパラメタurl/at-uriによるfetchと反映を実施（状態変更副作用が発生するため直接実行すると初期化処理と競合）
  useEffect(() => {
    if (url || atUri) {
      procedureQueryParameter(url, atUri, isOutputPlayer, isOutputCommentKI2, isOutputCommentKIF, step, isDebug);
    }
  }, [searchParams]);

  return (
    <>
        <div className="flex flex-row">
          <div className="flex flex-col">
            <div className="w-4 md:w-12 xl:w-24 2xl:w-48 h-[50vh] bg-[#B3936C]" />
            <div className="w-4 md:w-12 xl:w-24 2xl:w-48 h-[50vh] bg-white" />
          </div>
          <div className="border-x border-x-white bg-[#DEBF7E] p-2">
            <div className="border-2 border-black space-y-6">
              <div className="bg-[url('/board.jpg')] bg-cover">
                <Title />
                <Description />
              </div>
              <div className="p-2 space-y-6">
                <Input
                  setParsedInfoState={setParsedInfoState} parsedInfoState={parsedInfoState}
                  setKifuStoreState={setKifuStoreState} kifuStoreState={kifuStoreState}
                  setKifuManageState={setKifuManageState} kifuManageState={kifuManageState}
                  setURLState={setURLState} urlState={urlState}
                  setPostURLState={setPostURLState} postURLState={postURLState}
                  setSpecifiedOptionState={setSpecifiedOptionState} specifiedOptionState={specifiedOptionState}
                  isDebug={isDebug}
                />
                <KifuForJS kifuStoreState={kifuStoreState} />
                <ReplayURL />
                <HistoryView postURLState={postURLState} />
                <Export
                  parsedInfoState={parsedInfoState}
                  kifuManageState={kifuManageState}
                  urlState={urlState}
                  setSpecifiedOptionState={setSpecifiedOptionState} specifiedOptionState={specifiedOptionState}
                  isDebug={isDebug}
                />
                <Notice />
                <Footer />
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="w-4 md:w-12 xl:w-24 2xl:w-48 h-[50vh] bg-white" />
            <div className="w-4 md:w-12 xl:w-24 2xl:w-48 h-[50vh] bg-[#B3936C]" />
          </div>
        </div>
        {/* 以下は必要時のみ表示 */}
        <DialogBox
          isOpen={dialogBoxState.isOpen}
          onCancel={() => setDialogBoxState({ isOpen: false, textTitle: dialogBoxState.textTitle, textBody: dialogBoxState.textBody, })}
          onOK={() => setDialogBoxState({ isOpen: false, textTitle: dialogBoxState.textTitle, textBody: dialogBoxState.textBody, })}
          textTitle={dialogBoxState.textTitle}
          textBody={dialogBoxState.textBody}
        />
        <NowLoading
          isOpen = {nowLoadingState.isOpen}
          textTitle = {nowLoadingState.textTitle}
          textBody = {nowLoadingState.textBody}
        />
    </>
  );
}

/**
 * タイトル部分UIコンポーネント
 * @returns タイトル部分UIのJSX
 */
const Title: React.FC = () => {
  return (
    <div className="flex flex-row justify-center p-2">
      <Image src="/title.png" width="450" height="100" alt="Re:将棋thread" />
    </div>
  );
}

/**
 * 説明部分UIコンポーネント
 * @returns 説明部分UIのJSX
 */
const Description: React.FC = () => {
  return (
    <div>
      <div className="backdrop-blur-md p-2">
        <ul className="list-disc list-inside">
          <li>
            <Link href="https://bsky.app/" rel="noopener noreferrer" target="_blank">
              <span className="font-sans inline-flex items-center gap-1 rounded px-1 text-white bg-[#0085FF] hover:bg-[#0075EF] active:bg-[#0065DF]">
                Bluesky
                <FontAwesomeIcon icon={faBluesky} className="text-xs"/>
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs" />
              </span>
            </Link>
            に投稿されている
            <Link href="https://bsky.app/profile/shogithread.bsky.social"  rel="noopener noreferrer" target="_blank">
              <span className="inline-flex items-center gap-1 rounded px-1 text-black bg-[#FFE581] hover:bg-[#EFD571] active:bg-[#DFC561]">
                将棋<span className="font-sans">thread</span>
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs" />
              </span>
            </Link>
            の対局スレッドから棋譜を再生します。
          </li>
          <ol className="ml-3 list-decimal list-inside">
            <li>以下の入力欄に対局スレッド中の最終指し手ポストのURLを指定</li>
            <li>「棋譜リプレイ」を押す</li>
          </ol>
          <li>盤面の下にある操作パネルで指し手を進めたり戻したりできます。{' '}
            <Link href="https://whtwnd.com/did:plc:lfjssqqi6somnb7vhup2jm5w/entries/Re%3A%E5%B0%86%E6%A3%8Bthread" target="_blank">
              <span className="inline-flex items-center gap-1 rounded px-1 text-black bg-[#FFE581] hover:bg-[#EFD571] active:bg-[#DFC561]">
                説明ページ
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs" />
              </span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

/**
 * 留意事項部分UIコンポーネント
 * @returns 留意事項部分UIのJSX
 */
const Notice: React.FC = () => {
  return (
    <div>
      <hr />
      <h2 className="text-lg font-bold">[留意事項]</h2>
      <div>
        <ul className="list-disc list-inside">
          <li>利用によって被ったいかなる損害・トラブルについても、作者は一切責任を負いかねます。</li>
          <li>現バージョンでは手数が約500手を超えると正常に動作しないことが想定されます。</li>
          <li>「将棋thread対局URL」の指定は以下に従います。</li>
          <ul className="ml-3 list-disc list-inside">
            <li>以下のポストへのURLが有効です。</li>
            <ul className="ml-3 list-disc list-inside">
              <li>将棋threadによる投了「○○手で先手（後手）の勝ち」</li>
              <li>将棋threadによる指し手確定「○○手目:（指し手）」</li>
              <li>プレイヤーによる将棋threadへのリプライ</li>
            </ul>
            <li>指定URLが指すポストまでの棋譜が対象となります。指定URLより後（指定URLポストへのリプライ）の指し手については対象となりません。</li>
            <li>指定URLが将棋threadポストの場合、その指し手までがリプレイ対象となります。</li>
            <li>指定URLがプレイヤーのポストの場合、その前の指し手（リプライ先の将棋threadポスト）までが対象となります。</li>
          </ul>
        </ul>
      </div>
    </div>
  );
}

/**
 * フッター部分UIコンポーネント
 * @returns フッター部分UIのJSX
 */
const Footer: React.FC = () => {
  return (
    <div>
      <hr />
      <div className="font-sans">Version: {process.env.APP_VERSION}</div>
      <div className="font-sans">Copyright &copy; 2024 bills-appworks</div>
      <div className="font-sans">Author: (Bluesky{' '}
        <FontAwesomeIcon icon={faBluesky} className="text-xs"/>){' '}
        <Link href="https://bsky.app/profile/did:plc:lfjssqqi6somnb7vhup2jm5w" target="_blank">@bills-appworks.blue{' '}
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs" />
        </Link>
      </div>
      <hr />
      <PrivacyPolicy />
    </div>
  );
}
