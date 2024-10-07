/**
 * @author bills-appworks https://bsky.app/profile/did:plc:lfjssqqi6somnb7vhup2jm5w
 * @copyright bills-appworks 2024
 * @license This software is released under the MIT License. http://opensource.org/licenses/mit-license.php
 */

// Next.js
import { Noto_Sans_JP } from 'next/font/google';
// 定義参照
import { KifuStore } from 'kifu-for-js';
import { queryShogithread, ParsedInfoSingleMove, ParsedInfo, buildPostURL, convertATURItoURL } from '@/app/lib/bsky';
import { DialogBoxState } from '@/app/ui/dialog-box';
import { NowLoadingState } from '@/app/ui/now-loading';

export const notoSansJP = Noto_Sans_JP({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

// UIコンポーネント間でクエリ結果共有のための状態管理の型
export type KifuStoreState = {
  kifuStore: any;
};

export type KifuManageState = {
  isBuilt: boolean;
  step: number;
};

//export type ResultDisplayState = {
//  replayURL: string;
//  historyView: string;
//  dataUSI: string;
//  dataKI2: string;
//  dataKIF: string;
//};

export type SpecifiedOption = {
  isOutputPlayer: boolean;
  isOutputCommentKI2: boolean;
  isOutputCommentKIF: boolean;
};

// 状態初期値
const initialMoves: ParsedInfoSingleMove = {text: null, at: null, did: null, handle: null, displayName: null, alt: null, uri: null, };
export const initialParsedInfo: ParsedInfo = {moves:[initialMoves], text: "", movesAlt: "", resignAt: null, resignURI: null, };
export const initialKifuStore = { kifuStore: new KifuStore({ kifu: "", }) };
export const initialKifuManageState: KifuManageState = { isBuilt: false, step: 0, };
export const initialURLState: string = '';
//export const initialResultDisplayState: ResultDisplayState = { dataKIF: "", };
export const initialPostURLState: string = "";
export const initialSpecifiedOption: SpecifiedOption = { isOutputPlayer: true, isOutputCommentKI2: true, isOutputCommentKIF: true, };
export const initialDialogBoxState: DialogBoxState = { isOpen: false, textTitle: '確認してください', textBody: '', };
export const initialNowLoadingState: NowLoadingState = { isOpen: false, textTitle: 'NOW LOADING...', textBody: 'データを確認しています' };

export function getURLoriginPath() {
  const href = new URL(window.location.href);
  return href.origin + href.pathname;
}

export function setTextAreaById(id: string, text: string) {
  const element = document.getElementById(id);
  if (element && element instanceof HTMLTextAreaElement) {
    element.value = text;
  }
}

export function popCopiedBalloon(copyTextAreaId: string, copiedBalloonId: string) {
  const element = document.getElementById(copyTextAreaId);
  if (element && element instanceof HTMLTextAreaElement) {
    const text = element.value;
    navigator.clipboard.writeText(text);
    const copiedBalloonElement = document.getElementById(copiedBalloonId);
    if (copiedBalloonElement) {
      copiedBalloonElement.style.opacity = '0';
      copiedBalloonElement.style.visibility = 'visible';
      setTimeout(() => {
        copiedBalloonElement.style.opacity = '1';
        copiedBalloonElement.style.visibility = 'hidden';
      }, 3000);
    }
  }
}

export async function buildShogithreadInfo(
  url: string | null,
  atUri: string | null,
  isOutputPlayer: boolean,
  isOutputCommentKI2: boolean,
  isOutputCommentKIF: boolean,
  step : string | null,
//  setDialogBoxState: React.Dispatch<React.SetStateAction<DialogBoxState>>,
//  dialogBoxState: DialogBoxState,
): Promise<[ParsedInfo, any, string, string, string, string, string, string]> {
//  try{
    const [parsedInfo, kifuText, historyViewText, dataUSI, dataKI2, dataKIF] = await queryShogithread(url, atUri, isOutputPlayer, isOutputCommentKI2, isOutputCommentKIF);
    const kifuStore = new KifuStore({ kifu: kifuText });
//    const resultDisplayState: ResultDisplayState = {
//      replayURL: getURLoriginPath() + buildReplayURLParameters(url, profile, recordId, isOutputPlayer, isOutputCommentKI2, isOutputCommentKIF, step),
//      historyView: historyViewText,
//      dataUSI: dataUSI,
//      dataKI2: dataKI2,
//      dataKIF: dataKIF,
//    };
    const replayURL = getURLoriginPath() + buildReplayURLParameters(url, atUri, isOutputPlayer, isOutputCommentKI2, isOutputCommentKIF, step);
    const postURL = buildPostURL(parsedInfo, step ? parseInt(step) : null);
    return [parsedInfo, kifuStore, replayURL, historyViewText, postURL, dataUSI, dataKI2, dataKIF];
//  } catch(e: unknown) {
//    if (e instanceof Error) {
////      setDialogBoxState({ isOpen: true, textTitle: dialogBoxState.textTitle, textBody: e.message});
//      console.log(e);
//    }
//  }
};

export function buildReplayURLParameters(
  url: string | null,
  atUri: string | null,
  isOutputPlayer: boolean,
  isOutputCommentKI2: boolean,
  isOutputCommentKIF: boolean,
  step: string | null,
): string {
  if (!url) {
    if (atUri) {
      url = convertATURItoURL(atUri, undefined);
    } else {
      throw new Error('URLまたはAT-URIが必要です。');
    }
  }
  let parameters = {
    "url": url,
    "player": isOutputPlayer.toString(),
    "KI2-comment": isOutputCommentKI2.toString(),
    "KIF-comment": isOutputCommentKIF.toString(),
  };
  if (step) {
    parameters = { ...parameters, ...{step: step}};
  }
  const URLParameters = '?' + new URLSearchParams(parameters).toString();
  return URLParameters;
}


