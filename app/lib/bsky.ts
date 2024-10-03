// 定義参照
import { convertShogithreadToHistoryView, convertShogithreadToKI2, convertShogithreadToKIF, SpecifiedOption } from '@/app/lib/common';

const BskyPublicApiPrefix: string = 'https://public.api.bsky.app/xrpc';
const ShogithreadDID: string = 'did:plc:mpyhemzzouqzykmbwiblggwg';
const ShogithreadHandle: string = 'shogithread.bsky.social';
const ShogithreadUrlSpecifiedPostPrefix: string = 'https://bsky.app/profile';
const ShogithreadUrlValidRegExp: string = `^${ShogithreadUrlSpecifiedPostPrefix}/[^/]+/post/[^/]+$`
export const ShogithreadUrlPlaceholder: string = `${ShogithreadUrlSpecifiedPostPrefix}/********/post/********`;
const AtUriScheme: string = 'at://';
const AtUriCollectionPost: string = 'app.bsky.feed.post';
const MessageInvalidPostURL: string = '指定されたURLは有効な将棋threadスレッドのポストではありません';
const MessageErrorOfAPI: string = 'Bluesky APIエラー';
const MessageInternalError: string = '内部エラー';

// 単体指し手情報（各データはポストから未加工）
export type ParsedInfoSingleMove = {
  text: string | null, // ポストテキスト（将棋threadポストの確定手）
  at: string | null, // 指し手日時（プレイヤーポスト）
  did: string | null, // プレイヤーDID
  handle: string | null, // プレイヤーハンドル
  displayName: string | null, // プレイヤー表示名
  alt: string | null, // 将棋threadポストの画像のalt（usi）
  uri: string | null, // プレイヤーポストのuri
}

// スレッド解析情報（各データはポストから未加工）
export type ParsedInfo = {
  moves: ParsedInfoSingleMove[], // スレッドの棋譜履歴（単体指し手情報の配列）
  text: string, // 指定URLポストのテキスト
  movesAlt: string, // 指定スレッドでの最終指し手の将棋threadポストの画像のalt（usi）
  resignAt: string | null, // 投了日時（指定URLのポストが投了確定でない場合はnull）
};


// TODO: 全般的にAPIレスポンスオブジェクト構造の検証

// 指し手履歴スレッドをクエリ
// パラメタ
//   formData：画面フォームデータ
//     url：指し手履歴スレッド中のいずれかのポスト参照URL
// 戻り値
//   指し手履歴KI2棋譜データ
/*
export async function queryShogithread(formData: FormData, specifiedOptionState: SpecifiedOption): Promise<[ParsedInfo, string, string, string, string, string]> {
  const rawFormData = {
    url: formData.get('url'),
  }
//  console.log("formData: " + formData);
//  console.log("url: " + rawFormData.url);
  let kifuText: string = '';
  let historyViewText: string = '';
  let dataUSI: string = '';
  let dataKI2: string = '';
  let dataKIF: string = '';
  let parsedInfo: ParsedInfo = { moves: [], text: '', movesAlt: '', resignAt: null, };
  if (rawFormData.url) {
    parsedInfo = await parseSpecifiedURL(rawFormData.url.toString(), specifiedOptionState.isOutputPlayer);

//      console.log(parsedInfo.moves.map((x)=>{return x.text?.replace(/.+([△▲][^ ]+) .+$/, "$1")}).join(" "));

    kifuText = convertShogithreadToKI2(parsedInfo, specifiedOptionState.isOutputPlayer, true);
    historyViewText = convertShogithreadToHistoryView(parsedInfo, specifiedOptionState.isOutputPlayer);
    dataUSI = parsedInfo.movesAlt;
    dataKI2 = kifuText;
    dataKIF = convertShogithreadToKIF(parsedInfo, false, specifiedOptionState.isOutputPlayer, specifiedOptionState.isOutputCommentKIF, true);
  } else {
    throw new Error('フォームデータが無効です');
  }
  return [parsedInfo, kifuText, historyViewText, dataUSI, dataKI2, dataKIF];
}
*/
export async function queryShogithread(
  url: string | null,
  profile: string | null,
  recordId: string | null,
  isOutputPlayer: boolean,
  isOutputCommentKI2: boolean,
  isOutputCommentKIF: boolean,
): Promise<[ParsedInfo, string, string, string, string, string]> {
//  console.log("url: " + url);
  let kifuText: string = '';
  let historyViewText: string = '';
  let dataUSI: string = '';
  let dataKI2: string = '';
  let dataKIF: string = '';

  const parsedInfo = await parseSpecifiedURL(url, profile, recordId);

//  console.log(parsedInfo.moves.map((x)=>{return x.text?.replace(/.+([△▲][^ ]+) .+$/, "$1")}).join(" "));

  kifuText = convertShogithreadToKI2(parsedInfo, isOutputPlayer, true);
  historyViewText = convertShogithreadToHistoryView(parsedInfo, isOutputPlayer);
  dataUSI = parsedInfo.movesAlt;
  dataKI2 = convertShogithreadToKI2(parsedInfo, isOutputPlayer, isOutputCommentKI2);
  dataKIF = convertShogithreadToKIF(parsedInfo, false, isOutputPlayer, isOutputCommentKIF, true);
  return [parsedInfo, kifuText, historyViewText, dataUSI, dataKI2, dataKIF];
}

// 指定URLを解析
// パラメタ
//   url：利用者指定URL
// 戻り値
//   解析情報（ParsedInfo）
async function parseSpecifiedURL(url: string | null, profile: string | null, recordId: string | null): Promise<ParsedInfo> {
  // TODO:ハンドルまたはDID、record idのスマートな抽出

  let profileIdentity = null;
  if (url) {
    // 明らかにBlueskyポストを示すものではないURLの除外
    if (!new RegExp(`${ShogithreadUrlValidRegExp}`).test(url)) {
      throw new Error(MessageInvalidPostURL);
    }

    // ハンドルまたはDIDの確認
    profileIdentity = url.replace(`${ShogithreadUrlSpecifiedPostPrefix}/`, '');
    profileIdentity = profileIdentity.replace(/^([^/]+)\/.+$/,"$1");
    // URLからrecord idを抽出
    recordId = url.replace(`${ShogithreadUrlSpecifiedPostPrefix}/${profileIdentity}/post/`, '');
  } else{
    if (!profile || !recordId) {
      throw new Error('パラメタにはハンドルまたはDID、レコードIDを指定してください。');
    }
    profileIdentity = profile;
  }
  const isShogithread: boolean = (profileIdentity === ShogithreadHandle || profileIdentity === ShogithreadDID);

  // AT URIを構築：at://<DID>/app.bsky.feed.post/<record key>
  if (isShogithread) {
    profileIdentity = ShogithreadDID;
  } else {
    // ハンドルが将棋threadでなければDID取得
    if (!profileIdentity.startsWith('did:')) {
      profileIdentity = await getDID(profileIdentity);
    }
  }
  const atUri: string = `${AtUriScheme}${profileIdentity}/${AtUriCollectionPost}/${recordId}`;
  // Bluesky APIで指定URLポストのスレッド情報取得（親方向のみ）
  let apiResponse = await getPostThread(atUri);

// for debug
//  // APIレスポンスをJSONシリアライズ（空白インデント:2）
  const apiResponseString = JSON.stringify(apiResponse, null, 2);
  console.log(`api response: ${apiResponseString}`);

  const parsedInfo: ParsedInfo = { moves: [], text: apiResponse.thread.post.record.text, movesAlt: '', resignAt: null };
  if (isShogithread) { // 指定URLが将棋threadのポスト
    // ポストrecordのlexicon（キー$typeの値）からURL指定ポストが投了ポストかスレッド中ポストかを判別し、投了ポストなら引用内の最終指し手ポストを改めて解析対象とする
    const lexicon: string = apiResponse.thread.post.record.embed["$type"];
//    console.log(`lexicon: ${lexicon}`);

    // KIFフォーマットなど投了情報を使用する場合の参考
    //let isResign: boolean = false;

    switch(lexicon) {
      case 'app.bsky.embed.record': // 通常レコード（画像埋め込みなし）：投了ポストと仮定
        // 投了日時は投了ポスト基準
        parsedInfo.resignAt = apiResponse.thread.post.indexedAt;
        // 引用内ポストを最終指し手ポストとしてスレッド再取得
        apiResponse = await getPostThread(apiResponse.thread.post.embed.record.uri);

        // fall-through：そのまま指し手ポストの解析を続行
      case 'app.bsky.embed.images': // 画像埋め込みあり：指し手ポストと仮定
        parseThread(apiResponse.thread, parsedInfo);
        break;
      default:
        // TODO: エラー処理
        throw new Error(`想定外のlexicon: ${lexicon}`);
    }
  } else { // 指定URLが将棋thread以外のポストならばリプライ親ポストの将棋threadポストを処理対象とする
    if (apiResponse.thread.hasOwnProperty('parent')) {
      const parentDID: string = apiResponse.thread.parent.post.author.did;

// for debug
//      const parentHandle = apiResponse.thread.parent.post.author.handle;
//      console.log(`parent handle: ${parentHandle}`);

      if (parentDID === ShogithreadDID) {
        parseThread(apiResponse.thread.parent, parsedInfo);
      } else { // リプライ先が将棋threadポストではない
        throw new Error(`${MessageInvalidPostURL}: リプライ先が将棋threadではありません`);
      }
    } else { // リプライ先が存在しない
      throw new Error(`${MessageInvalidPostURL}: 将棋threadへのリプライではありません`);
    }
  }
  return parsedInfo;
}

// Bluesky APIでDID取得
// パラメタ
//   handle：ハンドル
// 戻り値
//   DID
async function getDID(handle: string) {
  const params: Record<string, string> = {
    handle: handle,
  };
//  console.log(params);
  const urlSearchParams: URLSearchParams = new URLSearchParams(params);
  const queryUrl: string = `${BskyPublicApiPrefix}/com.atproto.identity.resolveHandle?${urlSearchParams}`;
//  console.log(`query url: ${queryUrl}`)
  const response: Response = await fetch(queryUrl, {
    method: "GET",
    headers: {
      "Accept":"application/json"
    }
  });
//  console.log(`response status: ${response.status}`);
  if (response.status != 200) {
    throw new Error(`${MessageErrorOfAPI}: resolveHandle@getDID`);
  }
  const apiResponse = await response.json();
  return apiResponse.did;
}

// Bluesky APIでスレッド情報取得
// パラメタ
//   at_uri：利用者指定URLのポストを示すAT URI
// 戻り値
//   JavaScriptオブジェクト化したgetPostThread APIレスポンス
async function getPostThread(atUri: string) {
  const params: Record<string, string> = {
    uri: atUri,
    depth: "0", // 指定URLポストの子リプライは取得しない
    parentHeight: "1000", // 指定URLポストの親リプライチェーン取得最大数（API仕様最大値）
  };
//  console.log(params);
  const urlSearchParams: URLSearchParams = new URLSearchParams(params);
  const queryUrl: string = `${BskyPublicApiPrefix}/app.bsky.feed.getPostThread?${urlSearchParams}`;
//  console.log(`query url: ${queryUrl}`)
  const response: Response = await fetch(queryUrl, {
    method: "GET",
    headers: {
      "Accept":"application/json"
    }
  });
//  console.log(`response status: ${response.status}`);
  if (response.status != 200) {
    throw new Error(`${MessageErrorOfAPI}: getPostThread`);
  }
  const apiResponse = await response.json();
  return apiResponse;
}

// スレッド解析
// パラメタ
//   thread：getPostThread APIレスポンスJSON中のthreadオブジェクト（先頭ポストは将棋thread指し手ポストと仮定）
//   parsedInfo：解析情報
// 戻り値
function parseThread(thread: any, parsedInfo: ParsedInfo) {
  // TODO:getPostThread上限を解決してリプライ先祖をさらにたどる場合は循環参照検出
  // TODO: APIレスポンスオブジェクト構造（threadオブジェクト構造）の検証・型
  // 画像のaltプロパティに埋め込まれている指し手履歴情報
  parsedInfo.movesAlt = thread.post.record.embed.images[0].alt;
  // textに埋め込まれている指し手情報
  const text: string = thread.post.record.text;

  // リプライ先親ポスト（人による指し手ポストを仮定）を解析
  if (thread.hasOwnProperty('parent')) {
    parseParent(thread.parent, parsedInfo);
  } else {
    throw new Error(`${MessageInternalError}: parseThread`);
  }
  // 指し手履歴配列に解析開始指し手（解析対象最終手）テキストを設定
  const playerMove: ParsedInfoSingleMove | undefined = parsedInfo.moves.at(-1);
  if (playerMove !== undefined) {
    playerMove.text = text;
  }
}

// リプライ先親ポスト（先行指し手）の解析
// パラメタ
//   parent：スレッド構造の先行処理ポストのparentオブジェクト
//   parsedInfo：解析情報
function parseParent(parent: any, parsedInfo: ParsedInfo) {
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

//  console.log(`${moveAt} ${text}`);

  // 子ポストフラグ：処理中ポストのparentが存在すればtrue
  const isChild = parent.hasOwnProperty('parent');
  // 処理中ポストが子ポストであれば親ポストを再帰解析
  // 履歴情報構築前にスレッドを遡って辿り、折り返しで戻る際にparsedInfo.movesにpushすることにより配列要素は時系列順に整列
  if (isChild) {
    parseParent(parent.parent, parsedInfo);
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

export function buildPostURL(parsedInfo: ParsedInfo, step: number | null): string {
  if (step && step > 0) {
    const handle = parsedInfo.moves[step - 1].handle;
    const uri = parsedInfo.moves[step - 1].uri;
    const recordId = uri?.replace(/.+\/([^/]+)$/, "$1");
    return `${ShogithreadUrlSpecifiedPostPrefix}/${handle}/post/${recordId}`;
  } else {
    return '';
  }
}
