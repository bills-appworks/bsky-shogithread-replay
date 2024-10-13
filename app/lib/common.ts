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
/**
 * Kifu for JSのKifuStoreオブジェクト管理State
 * @type {Object} KifuStoreState
 * @property {any} kifuStore KifuStoreオブジェクト
 */
export type KifuStoreState = {
  kifuStore: any;
};

/**
 * 棋譜再生情報管理State
 * @type {Object} kifuManageState
 * @property {boolean} isBuilt 棋譜スレッド解析情報構築済
 * @property {number} step 再生中の手数
 */
export type KifuManageState = {
  isBuilt: boolean;
  step: number;
};

/**
 * 指定オプション管理State
 * @type {Object} SpecifiedOption
 * @property {boolean} isOutputPlayer プレイヤー名出力有無
 * @property {boolean} isOutputCommentKI2 KI2形式コメント出力有無
 * @property {boolean} isOutputCommentKIF KIF形式コメント出力有無
 */
export type SpecifiedOption = {
  isOutputPlayer: boolean;
  isOutputCommentKI2: boolean;
  isOutputCommentKIF: boolean;
};

// 状態初期値
const initialMoves: ParsedInfoSingleMove = {
  text: null,
  at: null,
  did: null,
  handle: null,
  displayName: null,
  alt: null,
  uri: null,
};
export const initialParsedInfo: ParsedInfo = {
  moves: [initialMoves],
  text: "",
  movesAlt: "",
  resignAt: null,
  resignURI: null,
};
export const initialKifuStore = {
  kifuStore: new KifuStore({ kifu: "", }),
};
export const initialKifuManageState: KifuManageState = {
  isBuilt: false,
  step: 0,
};
export const initialURLState: string = '';
export const initialPostURLState: string = "";
export const initialSpecifiedOption: SpecifiedOption = {
  isOutputPlayer: true,
  isOutputCommentKI2: true,
  isOutputCommentKIF: true,
};
export const initialDialogBoxState: DialogBoxState = {
  isOpen: false,
  textTitle: '確認してください',
  textBody: '',
};
export const initialNowLoadingState: NowLoadingState = {
  isOpen: false,
  textTitle: 'NOW LOADING...',
  textBody: 'データを確認しています'
};

/**
 * Webブラウザ管理URLからオリジン+パス文字列(https://host/path)を取得
 * @returns URLオリジン+パス文字列
 */
export function getURLoriginPath() {
  const href = new URL(window.location.href);
  return href.origin + href.pathname;
}

/**
 * 指定したテキストエリアHTML要素にテキストを設定
 * @param id テキスト設定対象テキストエリアHTML要素ID
 * @param text 設定テキスト
 */
export function setTextAreaById(id: string, text: string) {
  const element = document.getElementById(id);
  if (element && element instanceof HTMLTextAreaElement) {
    element.value = text;
  }
}

/**
 * テキストエリアからクリップボードにテキストをコピーして完了バルーン一時表示
 * @param copyTextAreaId コピー対象テキストエリアHTML要素ID
 * @param copiedBalloonId コピー完了バルーンHTML要素ID
 */
export function popCopiedBalloon(copyTextAreaId: string, copiedBalloonId: string) {
  const element = document.getElementById(copyTextAreaId);
  if (element && element instanceof HTMLTextAreaElement) {
    // テキストエリアのテキストをクリップボードにコピー
    const text = element.value;
    navigator.clipboard.writeText(text);
    // コピー完了バルーン表示
    const copiedBalloonElement = document.getElementById(copiedBalloonId);
    if (copiedBalloonElement) {
      // 非表示化していたバルーンを表示
      copiedBalloonElement.style.opacity = '0';
      copiedBalloonElement.style.visibility = 'visible';
      // 3秒後にバルーンを非表示（フェードアウトするトランジションはCSSで設定）
      setTimeout(() => {
        copiedBalloonElement.style.opacity = '1';
        copiedBalloonElement.style.visibility = 'hidden';
      }, 3000);
    }
  }
}

/**
 * 将棋thread関連棋譜スレッド情報構築
 * @param url 棋譜スレッドBlueskyポストURL
 * @param atUri 棋譜スレッドBlueskyポストAT-URI
 * @param isOutputPlayer プレイヤー名出力有無
 * @param isOutputCommentKI2 KI2形式コメント出力有無
 * @param isOutputCommentKIF KIF形式コメント出力有無
 * @param step 棋譜手数
 * @param isDebug デバッグモード
 * @returns 各種解析情報配列
 *  parsedInfo 解析情報オブジェクト
 *  kifuStore Kifu for JS KifuStoreオブジェクト
 *  replayURL 再現URLテキスト
 *  historyViewText スレッド一覧テキスト
 *  postURL Blueskyで開く指し手ポストURL文字列
 *  dataUSI SFEN(USI)形式棋譜データ文字列
 *  dataKI2 KI2形式棋譜データ文字列
 *  dataKIF KIF形式棋譜データ文字列
 */
export async function buildShogithreadInfo(
  url: string | null,
  atUri: string | null,
  isOutputPlayer: boolean,
  isOutputCommentKI2: boolean,
  isOutputCommentKIF: boolean,
  step : string | null,
  isDebug: boolean,
): Promise<[ParsedInfo, any, string, string, string, string, string, string]> {
  const [
    parsedInfo,
    kifuText,
    historyViewText,
    dataUSI,
    dataKI2,
    dataKIF
  ] = await queryShogithread(
    url,
    atUri,
    isOutputPlayer,
    isOutputCommentKI2,
    isOutputCommentKIF,
    isDebug
  );
  const kifuStore = new KifuStore({ kifu: kifuText });
  const replayURL = getURLoriginPath() + buildReplayURLParameters(url, atUri, isOutputPlayer, isOutputCommentKI2, isOutputCommentKIF, step);
  const postURL = buildPostURL(parsedInfo, step ? parseInt(step) : null);
  return [
    parsedInfo,
    kifuStore,
    replayURL,
    historyViewText,
    postURL,
    dataUSI,
    dataKI2,
    dataKIF,
  ];
};

/**
 * 棋譜スレッドURL/URIと指定オプションから再現URLのクエリパラメタ文字列を構築
 * @param url 棋譜スレッドBlueskyポストURL
 * @param atUri 棋譜スレッドBlueskyポストAT-URI
 * @param isOutputPlayer プレイヤー名出力有無
 * @param isOutputCommentKI2 KI2形式コメント出力有無
 * @param isOutputCommentKIF KIF形式コメント出力有無
 * @param step 棋譜手数
 * @returns 再現URLクエリパラメタ文字列（?url=...&player=...）
 */
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
  // URLSearchParamsに処理させるためのパラメタオブジェクト
  let parameters = {
    "url": url,
    "player": isOutputPlayer.toString(),
    "KI2-comment": isOutputCommentKI2.toString(),
    "KIF-comment": isOutputCommentKIF.toString(),
  };
  // 手数パラメタ追加
  if (step) {
    parameters = { ...parameters, ...{step: step}};
  }
  const URLParameters = '?' + new URLSearchParams(parameters).toString();
  return URLParameters;
}
