'use client';

//import Image from "next/image";
import Input from '@/app/ui/input';
import KifuForJS from '@/app/ui/kifu-for-js';
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
        <Footer />
      </div>
    </div>
  );
}

// タイトル
const Title: React.FC = () => {
  return (
    <div>
      <div>将棋thread Replay</div>
    </div>
  );
}

// 説明
const Description: React.FC = () => {
  return (
    <div>
      <div>
        <h2>概要</h2>
        <div></div>
      </div>
      <div>
        <h2>留意事項</h2>
        <div>
          <ul>
            <li>利用によって被ったいかなる損害・トラブルについても、作者は一切責任を負いかねます。</li>
            <li>現バージョンでは手数が約500手を超えると正常に動作しないことが想定されます。</li>
          </ul>
        </div>
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