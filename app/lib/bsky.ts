import { convertShogithreadToKI2 } from '@/app/lib/common';
import { KifuStore } from 'kifu-for-js';

const BskyPublicApiPrefix: string = 'https://public.api.bsky.app/xrpc';
const ShogithreadDID: string = 'did:plc:mpyhemzzouqzykmbwiblggwg';
const ShogithreadHandle: string = 'shogithread.bsky.social';
const ShogithreadUrlSpecifiedPostPrefix: string = 'https://bsky.app/profile';
const ShogithreadUrlValidRegExp: string = `^${ShogithreadUrlSpecifiedPostPrefix}/[^/]+/post/[^/]+$`
//const ShogithreadUrlProfile = `${ShogithreadUrlSpecifiedPostPrefix}/${ShogithreadHandle}`;
//const ShogithreadUrlPostPathFragment = 'post';
//const ShogithreadUrlPostPrefix = `${ShogithreadUrlProfile}/${ShogithreadUrlPostPathFragment}`;
export const ShogithreadUrlPlaceholder: string = `${ShogithreadUrlSpecifiedPostPrefix}/********/post/********`;
const AtUriScheme: string = 'at://';
const AtUriCollectionPost: string = 'app.bsky.feed.post';
const MessageInvalidPostURL: string = '指定されたURLは有効な将棋threadスレッドのポストではありません';

export type ParsedInfoSingleMove = {
  text: string | null,
  at: string | null,
  did: string | null,
  handle: string | null,
  displayName: string | null,
}

export type ParsedInfo = {
  moves: ParsedInfoSingleMove[],
  movesAlt: string,
};

export async function queryShogithread(formData: FormData): Promise<string> {
  const rawFormData = {
    url: formData.get('url'),
  }
//  console.log("formData: " + formData);
//  console.log("url: " + rawFormData.url);
  let kifuText = '';
  if (rawFormData.url) {
    const parsedInfo = await parseSpecifiedURL(rawFormData.url.toString());

    console.log(parsedInfo.moves.map((x)=>{return x.text?.replace(/.+([△▲][^ ]+) .+$/, "$1")}).join(" "));

    kifuText = convertShogithreadToKI2(parsedInfo);
  } else {
    throw new Error('フォームデータが無効です');
  }
  return kifuText;
}

// 指定URLを解析
// パラメタ
//   url：利用者指定URL
// 戻り値
//   解析情報（ParsedInfo）
async function parseSpecifiedURL(url: string): Promise<ParsedInfo> {
  // TODO:ハンドルまたはDID、record idのスマートな抽出

  // 明らかにBlueskyポストを示すものではないURLの除外
  if (!new RegExp(`${ShogithreadUrlValidRegExp}`).test(url)) {
    throw new Error(MessageInvalidPostURL);
  }

  // ハンドルまたはDIDの確認
  let profileIdentity: string = url.replace(`${ShogithreadUrlSpecifiedPostPrefix}/`, '');
  profileIdentity = profileIdentity.replace(/^([^/]+)\/.+$/,"$1");
  const isShogithread: boolean = (profileIdentity === ShogithreadHandle || profileIdentity === ShogithreadDID);

  // URLからrecord idを抽出
  const recordId = url.replace(`${ShogithreadUrlSpecifiedPostPrefix}/${profileIdentity}/post/`, '');
  // AT URIを構築：at://<DID>/app.bsky.feed.post/<record key>
  if (isShogithread) {
    profileIdentity = ShogithreadDID;
  } else {
    // ハンドルが将棋threadでなければDID取得
    if (!profileIdentity.startsWith('did:')) {
      profileIdentity = await getDID(profileIdentity);
    }
  }
  const atUri = `${AtUriScheme}${profileIdentity}/${AtUriCollectionPost}/${recordId}`;
  // Bluesky APIで指定URLポストのスレッド情報取得（親方向のみ）
  let apiResponse = await getPostThread(atUri);

// for debug
  // APIレスポンスをJSONシリアライズ（空白インデント:2）
  const apiResponseString = JSON.stringify(apiResponse, null, 2);
  console.log(`api response: ${apiResponseString}`);

  let parsedInfo: ParsedInfo = { moves: [], movesAlt: '' };
  // TODO: APIレスポンスオブジェクト構造の検証
  const lexicon = apiResponse.thread.post.record.embed["$type"];
//  console.log(`lexicon: ${lexicon}`);
  if (isShogithread) { // 指定URLが将棋threadのポスト
    // ポストrecordのlexicon（キー$typeの値）からURL指定ポストが投了ポストかスレッド中ポストかを判別し、投了ポストなら引用内の最終指し手ポストを改めて解析対象とする

    // KIFフォーマットなど投了情報を使用する場合
    //let isResign: boolean = false;

    switch(lexicon) {
      case 'app.bsky.embed.record': // 通常レコード（画像埋め込みなし）：投了ポストと仮定
        // KIFフォーマットなど投了情報を使用する場合
        /*
        isResign = true;
        // 投了日時は投了ポスト基準
        const resignAt = apiResponse.thread.post.indexedAt;
        */

        // 引用内ポストを最終指し手ポストとしてスレッド再取得
        apiResponse = await getPostThread(apiResponse.thread.post.embed.record.uri);

        // fall-through：そのまま指し手ポストの解析を続行
      case 'app.bsky.embed.images': // 画像埋め込みあり：指し手ポストと仮定
        parsedInfo = parseThread(apiResponse.thread);

        // KIFフォーマットなど投了情報を使用する場合
        /*
        if (isResign) {
          // 投了
          parsedInfo.moves.push({
            text: '投了',
            at: resignAt,
            did: null,
            handle: null,
            displayName: null,
          });
        } else {
          // 中断
          const parsedInfoLastMove: ParsedInfoSingleMove | undefined = parsedInfo.moves.at(-1);
          if (parsedInfoLastMove !== undefined) {
            parsedInfo.moves.push({
              text: '中断',
              at: parsedInfoLastMove.at,
              did: null,
              handle: null,
              displayName: null,
            });
          }
        }
        */
        break;
      default:
        // TODO: エラー処理
        throw new Error(`不明なlexicon: ${lexicon}`);
    }
  } else { // 指定URLが将棋thread以外のポスト
    if (apiResponse.thread.hasOwnProperty('parent')) {
      const parentDID = apiResponse.thread.parent.post.author.did;

// for debug
      const parentHandle = apiResponse.thread.parent.post.author.handle;
      console.log(`parent handle: ${parentHandle}`);

      if (parentDID === ShogithreadDID) {
//        // リプライ先ポストを将棋ポストとしてスレッド再取得
//        apiResponse = await getPostThread(apiResponse.thread.parent.post.uri);
        parsedInfo = parseThread(apiResponse.thread.parent);
      } 
    } else { // リプライ先が存在しない
      throw new Error(MessageInvalidPostURL);
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
  const params = {
    handle: handle,
  };
//  console.log(params);
  const urlSearchParams = new URLSearchParams(params);
  const queryUrl = `${BskyPublicApiPrefix}/com.atproto.identity.resolveHandle?${urlSearchParams}`;
//  console.log(`query url: ${queryUrl}`)
  const response = await fetch(queryUrl, {
    method: "GET",
    headers: {
      "Accept":"application/json"
    }
  });
  // TODO: 異常系対応
//  console.log(`response status: ${response.status}`);
  const apiResponse = await response.json();
  return apiResponse.did;
}

// Bluesky APIでスレッド情報取得
// パラメタ
//   at_uri：利用者指定URLのポストを示すAT URI
// 戻り値
//   JavaScriptオブジェクト化したgetPostThread APIレスポンス
async function getPostThread(atUri: string) {
  const params = {
    uri: atUri,
    depth: "0", // 指定URLポストの子リプライは取得しない
    parentHeight: "1000", // 指定URLポストの親リプライチェーン取得最大数（API仕様最大値）
  };
//  console.log(params);
  const urlSearchParams = new URLSearchParams(params);
  const queryUrl = `${BskyPublicApiPrefix}/app.bsky.feed.getPostThread?${urlSearchParams}`;
//  console.log(`query url: ${queryUrl}`)
  const response = await fetch(queryUrl, {
    method: "GET",
    headers: {
      "Accept":"application/json"
    }
  });
  // TODO: 異常系対応
//  console.log(`response status: ${response.status}`);
  const apiResponse = await response.json();
  return apiResponse;
}

// スレッド解析
// パラメタ
//   thread：getPostThread APIレスポンスJSON中のthreadオブジェクト
// 戻り値
//   解析情報（ParsedInfo）
function parseThread(thread: any): ParsedInfo {
  // TODO:getPostThread上限を解決してリプライ先祖をさらにたどる場合は循環参照検出
  // TODO: APIレスポンスオブジェクト構造（threadオブジェクト構造）の検証・型
  // 画像のaltプロパティに埋め込まれている指し手履歴情報
  const alt: string = thread.post.record.embed.images[0].alt;
  // textに埋め込まれている指し手情報
  const text: string = thread.post.record.text;
/*
  // 指し手時刻
  const moveAt = thread.post.indexedAt;
//  console.log(`alt: ${alt}`);
//  console.log(`text: ${text}`);
  // 指し手履歴配列
  const moves: string[] = [];
  // 指し手時刻履歴配列
  const movesAt: string[] = [];
*/
  const parsedInfo: ParsedInfo = { moves: [], movesAlt: alt };
  // リプライ先親ポストがあれば親ポスト（先行指し手）を解析
  if (thread.hasOwnProperty('parent')) {
    parseParent(thread.parent, parsedInfo);
  }
  // 指し手履歴配列に解析開始指し手（解析対象最終手）テキストを設定
  const playerMove: ParsedInfoSingleMove | undefined = parsedInfo.moves.at(-1);
  if (playerMove !== undefined) {
    playerMove.text = text;
  }
  return parsedInfo;
/*
  // 指し手履歴配列に解析開始指し手（解析対象最終手）を追加
  moves.push(text);
  // 指し手時刻履歴配列に解析開始指し手時刻（解析対象最終手時刻）を追加
  movesAt.push(moveAt);
  console.log(`moves: ${moves}`);
  console.log(`moves_at: ${movesAt}`);
  return {
    textMoves: moves,
    altMoves: alt,
    movesAt: movesAt,
  };
*/
}

// リプライ先親ポスト（先行指し手）の解析
// パラメタ
//   parent：スレッド構造の先行処理ポストのparentオブジェクト
//   moves：指し手履歴配列
//   moves_at：指し手時刻履歴配列
function parseParent(parent: any, parsedInfo: ParsedInfo) {
  // TODO: APIレスポンスオブジェクト構造（parentオブジェクト構造）の検証・型
  // textに埋め込まれている指し手情報
  const text = parent.post.record.text;
  // 指し手時刻
  const moveAt = parent.post.indexedAt;
  // ポスト（指し手）のアカウントDID
  const did = parent.post.author.did;
  // ポスト（指し手）のアカウントハンドル
  const handle = parent.post.author.handle;
  // ポスト（指し手）のアカウント表示名
  const displayName = parent.post.author.displayName;

  console.log(`${moveAt} ${text}`);

  // 子ポストフラグ：処理中ポストのparentが存在すればtrue
  const isChild = parent.hasOwnProperty('parent');
  // 処理中ポストが子ポストであれば親ポストを再帰解析
  if (isChild) {
    parseParent(parent.parent, parsedInfo);
  }
  // 処理中ポストが子ポストかつ将棋threadアカウントであれば指し手履歴に追加
  // →スレッド先頭の対局開始ポストは対象外、将棋threadアカウントの確定手のみ対象
/*
  if (isChild && (did === ShogithreadDid)) {
    moves.push(text);
    moves_at.push(moveAt);
  }
*/
  if (isChild) {
    if (did === ShogithreadDID) {
      // 将棋threadアカウント
      // リプライ元の指し手指示ポストから生成した履歴要素に遡ってtextを格納
      const playerMove: ParsedInfoSingleMove | undefined = parsedInfo.moves.at(-1);
      if (playerMove !== undefined) {
        playerMove.text = text;
      }
/*
      parsedInfo.moves.push({ text: text, at: null, did: null, handle: null, displayName: null});
*/
    } else {
      // 将棋threadアカウント以外（指し手指示）
      // textはリプライの将棋threadポストから取得
      parsedInfo.moves.push({ text: null, at: moveAt, did: did, handle: handle, displayName: displayName});
/*
      const actorMove: ParsedInfoSingleMove | undefined = parsedInfo.moves.at(-1);
      if (actorMove !== undefined) {
        actorMove.at = moveAt;
        actorMove.did = did;
        actorMove.handle = handle;
        actorMove.displayName = displayName;
      }
*/
    }
  }
}