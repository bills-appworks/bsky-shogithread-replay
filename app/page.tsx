'use client';

//import Image from "next/image";
import Input from '@/app/ui/input';
import KifuForJS from '@/app/ui/kifu-for-js';
import Export from '@/app/ui/export';
import PrivacyPolicy from '@/app/ui/privacy-policy';
import React from "react";
import { useState } from 'react';
import { ReplayState } from '@/app/lib/common';
import { KifuStore } from 'kifu-for-js';

export default function Home() {
  // InputコンポーネントでのonSubmit時の結果をKifuForJSコンポーネントに反映するためここで状態管理
  const initialReplayState: ReplayState = { kifuStore: new KifuStore({kifu: ""}), url: "" };
  const [ replayState, setReplayState ] = useState(initialReplayState);

  return (
    <div>
      <div>
        <Title />
        <Description />
        <Input setReplayState={setReplayState} replayState={replayState} />
        <KifuForJS replayState={replayState} />
        <Notice />
        <Export replayState={replayState} />
        <Footer />
      </div>
    </div>
  );
}

// タイトル
const Title: React.FC = () => {
  return (
    <div>
      <div>Re:将棋thread</div>
    </div>
  );
}

// 説明
const Description: React.FC = () => {
  return (
    <div>
      <h2>概要</h2>
      <div>
        <ul>
          <li>Bluesky SNSに投稿されている将棋threadの対局スレッドから棋譜を再生します。</li>
          <li>以下の「将棋thread URL」に対局スレッド中の最終手ポストのURLを指定して「棋譜リプレイ」を押してください。</li>
          <li>盤面の下にある操作パネルで指し手を進めたり戻したりできます。</li>
        </ul>
      </div>
    </div>
  );
}

// 留意事項
const Notice: React.FC = () => {
  return (
    <div>
      <h2>留意事項</h2>
      <div>
        <ul>
          <li>利用によって被ったいかなる損害・トラブルについても、作者は一切責任を負いかねます。</li>
          <li>現バージョンでは手数が約500手を超えると正常に動作しないことが想定されます。</li>
          <li>「将棋thread URL」の指定は以下に従います。</li>
          <ul>
            <li>以下のポストへのURLが有効です。</li>
            <ul>
              <li>将棋threadによる投了「○○手で先手（後手）の勝ち」</li>
              <li>将棋threadによる指し手確定「○○手目:（指し手）」</li>
              <li>プレイヤーによる将棋threadへのリプライ</li>
            </ul>
            <li>指定URLが指すポストまでの棋譜が対象となります。指定URLの後（指定URLポストへのリプライ）の指し手については対象となりません。</li>
            <li>指定URLが将棋threadポストの場合、その指し手までがリプレイ対象となります。指定URLがプレイヤーのポストの場合、その前の指し手（リプライ先の将棋threadポスト）までが対象となります。</li>
          </ul>
        </ul>
      </div>
    </div>
  );
}

// フッター
const Footer: React.FC = () => {
  return (
    <div>
      <hr />
      <div>Copyright &copy; 2024 bills-appworks</div>
      <div>Author: (Bluesky)@bills-appworks.blue</div>
      <hr />
      <PrivacyPolicy />
    </div>
  );
}