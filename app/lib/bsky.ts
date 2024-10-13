/**
 * @author bills-appworks https://bsky.app/profile/did:plc:lfjssqqi6somnb7vhup2jm5w
 * @copyright bills-appworks 2024
 * @license This software is released under the MIT License. http://opensource.org/licenses/mit-license.php
 */

// 定義参照
import { convertShogithreadToHistoryView, convertShogithreadToKI2, convertShogithreadToKIF } from '@/app/lib/convert';

const BskyPublicApiPrefix: string = 'https://public.api.bsky.app/xrpc';
const ShogithreadDID: string = 'did:plc:mpyhemzzouqzykmbwiblggwg';
const ShogithreadHandle: string = 'shogithread.bsky.social';
const ShogithreadUrlSpecifiedPostPrefix: string = 'https://bsky.app/profile';
// https://bsky.app/profile/<アカウント識別子>/post/<ポストuri>
const ShogithreadUrlValidRegExp: string = `^${ShogithreadUrlSpecifiedPostPrefix}/[^/]+/post/[^/]+$`
export const ShogithreadUrlPlaceholder: string = `${ShogithreadUrlSpecifiedPostPrefix}/********/post/********`;
const AtUriScheme: string = 'at://';
const AtUriCollectionPost: string = 'app.bsky.feed.post';
const MessageInvalidPostURL: string = '指定されたURLは有効な将棋threadスレッドのポストではありません';
const MessageErrorOfAPI: string = 'Bluesky APIエラー';
const MessageInternalError: string = '内部エラー';

/**
 * 単体指し手情報（各データはポストから未加工）
 * @type {Object} ParsedInfoSingleMove
 * @property {string | null} text ポストテキスト（将棋threadポストの確定手）
 * @property {string | null} at 指し手日時（プレイヤーポスト）
 * @property {string | null} did プレイヤーDID
 * @property {string | null} handle プレイヤーハンドル
 * @property {string | null} displayName プレイヤー表示名
 * @property {string | null} alt 将棋threadポストの画像のalt（SFEN/USI）
 * @property {string | null} uri プレイヤーポストのuri
 */
export type ParsedInfoSingleMove = {
  text: string | null,
  at: string | null,
  did: string | null,
  handle: string | null,
  displayName: string | null,
  alt: string | null,
  uri: string | null,
};

/**
 * スレッド解析情報（各データはポストから未加工）
 * @type {Object} ParsedInfo
 * @property {ParsedInfoSingleMove[]} moves スレッドの棋譜履歴（単体指し手情報の配列）
 * @property {string} text 指定URLポストのテキスト
 * @property {string} movesAlt 指定スレッドでの最終指し手の将棋threadポストの画像のalt（SFEN/USI）
 * @property {string | null} resignAt 投了日時（指定URLのポストが投了確定でない場合はnull）
 * @property {string | null} resignURI 投了ポストのuri（指定URLのポストが投了確定でない場合はnull）
 */
export type ParsedInfo = {
  moves: ParsedInfoSingleMove[],
  text: string,
  movesAlt: string,
  resignAt: string | null,
  resignURI: string | null,
};


// TODO: 全般的にAPIレスポンスオブジェクト構造の検証

// TODO: queryShogithreadByATURI()と統合
/**
 * 指し手履歴棋譜スレッドをクエリ（URL/AT-URI）
 * @param url 棋譜スレッドBlueskyポストURL
 * @param atUri 棋譜スレッドBlueskyポストAT-URI
 * @param isOutputPlayer プレイヤー名出力有無
 * @param isOutputCommentKI2 KI2形式コメント出力有無
 * @param isOutputCommentKIF KIF形式コメント出力有無
 * @param isDebug デバッグモード
 * @returns 各種解析情報配列
 *  parsedInfo 解析情報オブジェクト
 *  kifuText KI2形式抽出棋譜情報（Kifu for JS入力向け）
 *  historyViewText スレッド一覧テキスト
 *  dataUSI SFEN(USI)形式棋譜データ文字列
 *  dataKI2 KI2形式棋譜データ文字列
 *  dataKIF KIF形式棋譜データ文字列
 */
export async function queryShogithread(
  url: string | null,
  atUri: string | null,
  isOutputPlayer: boolean,
  isOutputCommentKI2: boolean,
  isOutputCommentKIF: boolean,
  isDebug: boolean,
): Promise<[ParsedInfo, string, string, string, string, string]> {
  if (isDebug) {
    console.log("url: " + url);
  }
  let kifuText: string = '';
  let historyViewText: string = '';
  let dataUSI: string = '';
  let dataKI2: string = '';
  let dataKIF: string = '';

  let parsedInfo;
  if (url) {
    parsedInfo = await parseSpecifiedURL(url, isDebug);
  } else if (atUri) {
    parsedInfo = await parseSpecifiedATURI(atUri, undefined, isDebug);
  } else {
    throw new Error('パラメタにURLまたはAT-URIを指定してください。');
  }

  if (isDebug) {
    console.log(parsedInfo.moves.map((x)=>{return x.text?.replace(/.+([△▲][^ ]+) .+$/, "$1")}).join(" "));
  }

  kifuText = convertShogithreadToKI2(parsedInfo, isOutputPlayer, true);
  historyViewText = convertShogithreadToHistoryView(parsedInfo, isOutputPlayer);
  dataUSI = parsedInfo.movesAlt;
  dataKI2 = convertShogithreadToKI2(parsedInfo, isOutputPlayer, isOutputCommentKI2);
  dataKIF = convertShogithreadToKIF(parsedInfo, false, isOutputPlayer, isOutputCommentKIF, true, isDebug);
  return [
    parsedInfo,
    kifuText,
    historyViewText,
    dataUSI,
    dataKI2,
    dataKIF,
  ];
}

/**
 * 指し手履歴棋譜スレッドをクエリ（AT-URI）
 * @param atUri 棋譜スレッドBlueskyポストAT-URI
 * @param isOutputPlayer プレイヤー名出力有無
 * @param isOutputCommentKI2 KI2形式コメント出力有無
 * @param isOutputCommentKIF KIF形式コメント出力有無
 * @param isDebug デバッグモード
 * @returns 各種解析情報配列
 *  parsedInfo 解析情報オブジェクト
 *  kifuText KI2形式抽出棋譜情報（Kifu for JS入力向け）
 *  historyViewText スレッド一覧テキスト
 *  dataUSI SFEN(USI)形式棋譜データ文字列
 *  dataKI2 KI2形式棋譜データ文字列
 *  dataKIF KIF形式棋譜データ文字列
 */
export async function queryShogithreadByATURI(
  aturi: string,
  isOutputPlayer: boolean,
  isOutputCommentKI2: boolean,
  isOutputCommentKIF: boolean,
  isDebug: boolean
): Promise<[ParsedInfo, string, string, string, string, string]> {
  if (isDebug) {
    console.log("aturi: " + aturi);
  }
  let kifuText: string = '';
  let historyViewText: string = '';
  let dataUSI: string = '';
  let dataKI2: string = '';
  let dataKIF: string = '';

  const parsedInfo = await parseSpecifiedATURI(aturi, undefined, isDebug);

  if (isDebug) {
    console.log(parsedInfo.moves.map((x)=>{return x.text?.replace(/.+([△▲][^ ]+) .+$/, "$1")}).join(" "));
  }

  kifuText = convertShogithreadToKI2(parsedInfo, isOutputPlayer, true);
  historyViewText = convertShogithreadToHistoryView(parsedInfo, isOutputPlayer);
  dataUSI = parsedInfo.movesAlt;
  dataKI2 = convertShogithreadToKI2(parsedInfo, isOutputPlayer, isOutputCommentKI2);
  dataKIF = convertShogithreadToKIF(parsedInfo, false, isOutputPlayer, isOutputCommentKIF, true, isDebug);
  return [
    parsedInfo,
    kifuText,
    historyViewText,
    dataUSI,
    dataKI2,
    dataKIF
  ];
}

/**
 * 指定ポストURLを解析
 * @param url 棋譜スレッドBlueskyポストURL
 * @param isDebug デバッグモード
 * @returns 解析情報オブジェクト
 */
async function parseSpecifiedURL(url: string, isDebug: boolean): Promise<ParsedInfo> {
  // TODO:ハンドルまたはDID、record idのスマートな抽出

  let profileIdentity = null;

  // 明らかにBlueskyポストを示すものではないURLの除外
  if (!new RegExp(`${ShogithreadUrlValidRegExp}`).test(url)) {
    throw new Error(MessageInvalidPostURL);
  }

  // ハンドルまたはDIDの確認
  profileIdentity = url.replace(`${ShogithreadUrlSpecifiedPostPrefix}/`, '');
  profileIdentity = profileIdentity.replace(/^([^/]+)\/.+$/,"$1");
  // URLからrecord idを抽出
  const recordId = url.replace(`${ShogithreadUrlSpecifiedPostPrefix}/${profileIdentity}/post/`, '');
  const isShogithread: boolean = (profileIdentity === ShogithreadHandle || profileIdentity === ShogithreadDID);

  // AT URIを構築：at://<DID>/app.bsky.feed.post/<record key>
  if (isShogithread) {
    profileIdentity = ShogithreadDID;
  } else {
    // ハンドルが将棋threadでなければDID取得
    if (!profileIdentity.startsWith('did:')) {
      profileIdentity = await getDID(profileIdentity, isDebug);
    }
  }
  const aturi: string = `${AtUriScheme}${profileIdentity}/${AtUriCollectionPost}/${recordId}`;
  return parseSpecifiedATURI(aturi, isShogithread, isDebug);
}

/**
 * 指定ポストAT-URIを解析
 * @param aturi 棋譜スレッドBlueskyポストAT-URI
 * @param isShogithread 指定ポストが将棋threadによるポスト（既知の場合の判定スキップ用）
 * @param isDebug デバッグモード
 * @returns 解析情報オブジェクト
 */
async function parseSpecifiedATURI(aturi: string, isShogithread: boolean | undefined, isDebug: boolean): Promise<ParsedInfo> {
  // Bluesky APIで指定URLポストのスレッド情報取得（親方向のみ）
  let apiResponse = await getPostThread(aturi, isDebug);

  if (isShogithread === undefined) {
    const profileIdentity = extractProfileIdentityFromATURI(aturi);
    isShogithread = (profileIdentity === ShogithreadHandle || profileIdentity === ShogithreadDID);
  }

  if (isDebug) {
    // APIレスポンスをJSONシリアライズ（空白インデント:2）
    const apiResponseString = JSON.stringify(apiResponse, null, 2);
    console.log(`api response: ${apiResponseString}`);
  }

  const parsedInfo: ParsedInfo = { moves: [], text: apiResponse.thread.post.record.text, movesAlt: '', resignAt: null, resignURI: null, };
  if (isShogithread) { // 指定URLが将棋threadのポスト
    // ポストrecordのlexicon（キー$typeの値）からURL指定ポストが投了ポストかスレッド中ポストかを判別し、投了ポストなら引用内の最終指し手ポストを改めて解析対象とする
    const lexicon: string = apiResponse.thread.post.record.embed["$type"];
    if (isDebug) {
      console.log(`lexicon: ${lexicon}`);
    }

    switch(lexicon) {
      case 'app.bsky.embed.record': // 通常レコード（画像埋め込みなし）：投了ポストと仮定
        // 投了日時は投了ポスト基準
        parsedInfo.resignAt = apiResponse.thread.post.indexedAt;
        parsedInfo.resignURI = apiResponse.thread.post.uri;
        // 引用内ポストを最終指し手ポストとしてスレッド再取得
        apiResponse = await getPostThread(apiResponse.thread.post.embed.record.uri, isDebug);

        // fall-through：そのまま指し手ポストの解析を続行
      case 'app.bsky.embed.images': // 画像埋め込みあり：指し手ポストと仮定
        parseThread(apiResponse.thread, parsedInfo, isDebug);
        break;
      default:
        // TODO: エラー処理
        throw new Error(`想定外のlexicon: ${lexicon}`);
    }
  } else { // 指定URLが将棋thread以外のポストならばリプライ親ポストの将棋threadポストを処理対象とする
    if (apiResponse.thread.hasOwnProperty('parent')) {
      const parentDID: string = apiResponse.thread.parent.post.author.did;

      if (isDebug) {
        const parentHandle = apiResponse.thread.parent.post.author.handle;
        console.log(`parent handle: ${parentHandle}`);
      }

      if (parentDID === ShogithreadDID) {
        parseThread(apiResponse.thread.parent, parsedInfo, isDebug);
      } else { // リプライ先が将棋threadポストではない
        throw new Error(`${MessageInvalidPostURL}: リプライ先が将棋threadではありません`);
      }
    } else { // リプライ先が存在しない
      throw new Error(`${MessageInvalidPostURL}: 将棋threadへのリプライではありません`);
    }
  }
  return parsedInfo;
}

/**
 * Bluesky APIでハンドルに対応するDID取得
 * @param handle ハンドル文字列
 * @param isDebug デバッグモード
 * @returns ハンドルに対応するDID文字列
 */
async function getDID(handle: string, isDebug: boolean) {
  const params: Record<string, string> = {
    handle: handle,
  };
  if (isDebug) {
    console.log(params);
  }
  const urlSearchParams: URLSearchParams = new URLSearchParams(params);
  const queryUrl: string = `${BskyPublicApiPrefix}/com.atproto.identity.resolveHandle?${urlSearchParams}`;
  if (isDebug) {
    console.log(`query url: ${queryUrl}`);
  }
  const response: Response = await fetch(queryUrl, {
    method: "GET",
    headers: {
      "Accept":"application/json"
    }
  });
  if (isDebug) {
    console.log(`response status: ${response.status}`);
  }
  if (response.status != 200) {
    throw new Error(`${MessageErrorOfAPI}: resolveHandle@getDID`);
  }
  const apiResponse = await response.json();
  return apiResponse.did;
}

/**
 * Bluesky APIでスレッド情報取得
 * @param atUri 棋譜スレッドBlueskyポストAT-URI
 * @param isDebug デバッグモード
 * @returns JavaScriptオブジェクト化したgetPostThread APIレスポンス
 */
async function getPostThread(atUri: string, isDebug: boolean) {
  const params: Record<string, string> = {
    uri: atUri,
    depth: "0", // 指定URLポストの子リプライは取得しない
    parentHeight: "1000", // 指定URLポストの親リプライチェーン取得最大数（API仕様最大値）
  };
  if (isDebug) {
    console.log(params);
  }
  const urlSearchParams: URLSearchParams = new URLSearchParams(params);
  const queryUrl: string = `${BskyPublicApiPrefix}/app.bsky.feed.getPostThread?${urlSearchParams}`;
  if (isDebug) {
    console.log(`query url: ${queryUrl}`);
  }
  const response: Response = await fetch(queryUrl, {
    method: "GET",
    headers: {
      "Accept":"application/json"
    }
  });
  if (isDebug) {
    console.log(`response status: ${response.status}`);
  }
  if (response.status != 200) {
    throw new Error(`${MessageErrorOfAPI}: getPostThread`);
  }
  const apiResponse = await response.json();
  return apiResponse;
}

/**
 * スレッド解析
 * @param thread getPostThread APIレスポンスJSON中のthreadオブジェクト（先頭ポストは将棋thread指し手ポストと仮定）
 * @param parsedInfo 解析情報オブジェクト
 * @param isDebug デバッグモード
 */
function parseThread(thread: any, parsedInfo: ParsedInfo, isDebug: boolean) {
  // TODO:getPostThread上限を解決してリプライ先祖をさらにたどる場合は循環参照検出
  // TODO: APIレスポンスオブジェクト構造（threadオブジェクト構造）の検証・型
  // 画像のaltプロパティに埋め込まれている指し手履歴情報
  parsedInfo.movesAlt = thread.post.record.embed.images[0].alt;
  // textに埋め込まれている指し手情報
  const text: string = thread.post.record.text;

  // リプライ先親ポスト（人による指し手ポストを仮定）を解析
  if (thread.hasOwnProperty('parent')) {
    parseParent(thread.parent, parsedInfo, isDebug);
  } else {
    throw new Error(`${MessageInternalError}: parseThread`);
  }
  // 指し手履歴配列に解析開始指し手（解析対象最終手）テキストを設定
  const playerMove: ParsedInfoSingleMove | undefined = parsedInfo.moves.at(-1);
  if (playerMove !== undefined) {
    playerMove.text = text;
  }
}

/**
 * リプライ先親ポスト（先行指し手）の解析
 * @param parent スレッド構造の先行処理ポストのparentオブジェクト
 * @param parsedInfo 解析情報オブジェクト
 * @param isDebug デバッグモード
 */
function parseParent(parent: any, parsedInfo: ParsedInfo, isDebug: boolean) {
  // TODO: APIレスポンスオブジェクト構造（parentオブジェクト構造）の検証・型
  // textに埋め込まれている指し手情報
  const text: string = parent.post.record.text;
  // 指し手時刻
  const moveAt: string = parent.post.indexedAt;
  // ポスト（指し手）のアカウントDID
  const did: string = parent.post.author.did;
  // ポスト（指し手）のアカウントハンドル
  const handle: string = parent.post.author.handle;
  // ポスト（指し手）のアカウント表示名
  let displayName: string = parent.post.author.displayName;
  if (parent.post.author.labels.length > 0) {
    if (parent.post.author.labels.some((element: any) => element.val == '!no-unauthenticated')) {
      displayName = '(非表示)'
    }
  }
  // ポスト（指し手）のuri
  const uri: string = parent.post.uri;

  if (isDebug) {
    console.log(`${moveAt} ${text}`);
  }

  // 子ポストフラグ：処理中ポストのparentが存在すればtrue
  const isChild = parent.hasOwnProperty('parent');
  // 処理中ポストが子ポストであれば親ポストを再帰解析
  // 履歴情報構築前にスレッドを遡って辿り、折り返しで戻る際にparsedInfo.movesにpushすることにより配列要素は時系列順に整列
  if (isChild) {
    parseParent(parent.parent, parsedInfo, isDebug);
  }

  // 以降はスレッド親ポスト再帰解析の戻り処理：処理順としては指し手の時系列順
  if (isChild) { // 子ポストのみ：将棋threadアカウントの対局開始ポストは処理対象外
    if (did === ShogithreadDID) {
      // 将棋threadアカウント
      // リプライ元の指し手指示ポストから生成した履歴要素に遡ってtext, altを格納
      const playerMove: ParsedInfoSingleMove | undefined = parsedInfo.moves.at(-1);
      if (playerMove !== undefined) {
        playerMove.text = text;
        playerMove.alt = parent.post.record.embed.images[0].alt;
      } else {
        throw new Error(`${MessageInternalError}: parseParent`);
      }
    } else {
      // 将棋threadアカウント以外（指し手指示）
      // 指し手履歴追加
      // text, altはリプライの将棋threadポスト処理時に設定
      parsedInfo.moves.push({ text: null, at: moveAt, did: did, handle: handle, displayName: displayName, alt: null, uri: uri, });
    }
  }
}

/**
 * 指定の解析情報と手数に対応するBlueskyで開く指し手ポストURL文字列を構築
 * @param parsedInfo 解析情報オブジェクト
 * @param step 手数
 * @returns Blueskyで開く指し手ポストURL文字列
 */
export function buildPostURL(parsedInfo: ParsedInfo, step: number | null): string {
  if (step && step > 0) {
    let handle, uri;
    if (parsedInfo.resignAt && step > parsedInfo.moves.length) {
      // 投了手数が指定された場合は将棋threadの投了ポストが対象
      handle = ShogithreadHandle;
      uri = parsedInfo.resignURI;
    } else {
      // 投了以外
      handle = parsedInfo.moves[step - 1].handle;
      uri = parsedInfo.moves[step - 1].uri;
    }
    const recordId = uri?.replace(/.+\/([^/]+)$/, "$1");
    return `${ShogithreadUrlSpecifiedPostPrefix}/${handle}/post/${recordId}`;
  } else {
    return '';
  }
}

/**
 * AT-URIから対応するポストURLに変換
 * @param atUri 棋譜スレッドBlueskyポストAT-URI
 * @param handle ハンドル（undefinedの場合はAT-URIから識別情報を抽出）
 * @returns BlueskyポストURL文字列
 */
export function convertATURItoURL(atUri: string, handle: string | undefined) {
  if (handle === undefined) {
    handle = extractProfileIdentityFromATURI(atUri);
  }
  const recordId = atUri?.replace(/.+\/([^/]+)$/, "$1");
  return `${ShogithreadUrlSpecifiedPostPrefix}/${handle}/post/${recordId}`;
}

/**
 * AT-URIからプロファイルと期待する識別情報を抽出
 * @param atUri 棋譜スレッドBlueskyポストAT-URI
 * @returns AT-URIから抽出した識別情報
 */
function extractProfileIdentityFromATURI(atUri: string) {
  const regexp = `^at:\/\/([^/]+)/${AtUriCollectionPost}/[^/]+$`;
  return atUri.replace(new RegExp(regexp), "$1");
}
