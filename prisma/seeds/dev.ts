import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedCommon } from "./common";

export async function seedDev(prisma: PrismaClient) {
  await seedCommon(prisma);

  const password = await bcrypt.hash("password123", 10);

  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      username: "alice",
      name: "Alice",
      email: "alice@example.com",
      password,
      bio: "フルスタック開発者を目指して毎日学習中。",
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      username: "bob",
      name: "Bob",
      email: "bob@example.com",
      password,
      bio: "データサイエンティストへの道を歩んでいます。",
    },
  });

  console.log("✓ users seeded (alice, bob)");

  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: alice.id, followingId: bob.id } },
    update: {},
    create: { followerId: alice.id, followingId: bob.id },
  });
  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: bob.id, followingId: alice.id } },
    update: {},
    create: { followerId: bob.id, followingId: alice.id },
  });

  const aliceGoal = await prisma.goal.upsert({
    where: { id: "seed-goal-alice" },
    update: {},
    create: {
      id: "seed-goal-alice",
      title: "フルスタック開発者になる",
      description: "JavaScript / React / Node.js をマスターしてフルスタック開発者を目指す",
      targetHours: 500,
      deadline: new Date("2025-12-31"),
      subject: "Web開発",
      tags: "JavaScript,React,Node.js",
      userId: alice.id,
    },
  });

  const bobGoal = await prisma.goal.upsert({
    where: { id: "seed-goal-bob" },
    update: {},
    create: {
      id: "seed-goal-bob",
      title: "データサイエンスをマスターする",
      description: "Python・機械学習・データ分析のスキルを習得する",
      targetHours: 400,
      deadline: new Date("2025-12-31"),
      subject: "データサイエンス",
      tags: "Python,機械学習,データ分析",
      userId: bob.id,
    },
  });

  console.log("✓ goals seeded");

  const aliceSessions = [
    {
      id: "seed-session-alice-1",
      startTime: new Date("2025-01-10T09:00:00Z"),
      endTime: new Date("2025-01-10T11:00:00Z"),
      duration: 7200,
      subject: "JavaScript",
      description:
        "JavaScript の非同期処理（Promise / async-await）を学んだ。コールバック地獄からの脱却を体験。",
      tags: "JavaScript,非同期,Promise",
      visibility: "public",
      goalId: aliceGoal.id,
      userId: alice.id,
    },
    {
      id: "seed-session-alice-2",
      startTime: new Date("2025-01-12T14:00:00Z"),
      endTime: new Date("2025-01-12T16:30:00Z"),
      duration: 9000,
      subject: "React",
      description:
        "React Hooks（useState / useEffect）の使い方をハンズオンで練習。カスタムフックも作ってみた。",
      tags: "React,Hooks,フロントエンド",
      visibility: "public",
      goalId: aliceGoal.id,
      userId: alice.id,
    },
    {
      id: "seed-session-alice-3",
      startTime: new Date("2025-01-15T10:00:00Z"),
      endTime: new Date("2025-01-15T12:00:00Z"),
      duration: 7200,
      subject: "Node.js",
      description:
        "Express で REST API を実装。CRUD エンドポイントの作成まで完了。ミドルウェアの仕組みも理解できた。",
      tags: "Node.js,Express,API",
      visibility: "public",
      goalId: aliceGoal.id,
      userId: alice.id,
    },
  ];

  for (const session of aliceSessions) {
    await prisma.studySession.upsert({
      where: { id: session.id },
      update: {},
      create: session,
    });
  }

  const bobSessions = [
    {
      id: "seed-session-bob-1",
      startTime: new Date("2025-01-11T09:00:00Z"),
      endTime: new Date("2025-01-11T11:30:00Z"),
      duration: 9000,
      subject: "Python",
      description:
        "Python の基礎文法とデータ構造（リスト・辞書・集合）を復習。内包表記の書き方が気持ちよかった。",
      tags: "Python,基礎,データ構造",
      visibility: "public",
      goalId: bobGoal.id,
      userId: bob.id,
    },
    {
      id: "seed-session-bob-2",
      startTime: new Date("2025-01-13T13:00:00Z"),
      endTime: new Date("2025-01-13T15:00:00Z"),
      duration: 7200,
      subject: "機械学習",
      description:
        "scikit-learn で線形回帰と決定木モデルを実装。過学習の概念と交差検証を実践した。",
      tags: "機械学習,scikit-learn,モデル",
      visibility: "public",
      goalId: bobGoal.id,
      userId: bob.id,
    },
    {
      id: "seed-session-bob-3",
      startTime: new Date("2025-01-16T09:00:00Z"),
      endTime: new Date("2025-01-16T11:00:00Z"),
      duration: 7200,
      subject: "データ分析",
      description:
        "pandas と matplotlib を使ってデータの可視化を実践。グループ集計と折れ線グラフを組み合わせた。",
      tags: "pandas,matplotlib,可視化",
      visibility: "public",
      goalId: bobGoal.id,
      userId: bob.id,
    },
  ];

  for (const session of bobSessions) {
    await prisma.studySession.upsert({
      where: { id: session.id },
      update: {},
      create: session,
    });
  }

  console.log("✓ study sessions seeded (alice×3, bob×3)");

  const comments = [
    {
      id: "seed-comment-1",
      content:
        "非同期処理の解説、すごくわかりやすいです！自分も同じところで詰まったので参考になります。",
      userId: bob.id,
      sessionId: "seed-session-alice-1",
    },
    {
      id: "seed-comment-2",
      content:
        "React Hooks はプロジェクトでも使えますね。useEffect の依存配列、最初は難しかったです。",
      userId: bob.id,
      sessionId: "seed-session-alice-2",
    },
    {
      id: "seed-comment-3",
      content:
        "Python の基礎から丁寧に進んでいていいですね！辞書操作は慣れると便利ですよ。",
      userId: alice.id,
      sessionId: "seed-session-bob-1",
    },
    {
      id: "seed-comment-4",
      content:
        "scikit-learn の決定木、私も試してみたいです。可視化ツールもあわせて使うと分かりやすくなりますよ！",
      userId: alice.id,
      sessionId: "seed-session-bob-2",
    },
  ];

  for (const comment of comments) {
    await prisma.comment.upsert({
      where: { id: comment.id },
      update: {},
      create: comment,
    });
  }

  console.log("✓ comments seeded");

  const reactions = [
    {
      id: "seed-reaction-1",
      type: "like",
      userId: bob.id,
      sessionId: "seed-session-alice-1",
    },
    {
      id: "seed-reaction-2",
      type: "clap",
      userId: bob.id,
      sessionId: "seed-session-alice-2",
    },
    {
      id: "seed-reaction-3",
      type: "fire",
      userId: bob.id,
      sessionId: "seed-session-alice-3",
    },
    {
      id: "seed-reaction-4",
      type: "heart",
      userId: alice.id,
      sessionId: "seed-session-bob-1",
    },
    {
      id: "seed-reaction-5",
      type: "like",
      userId: alice.id,
      sessionId: "seed-session-bob-2",
    },
    {
      id: "seed-reaction-6",
      type: "clap",
      userId: alice.id,
      sessionId: "seed-session-bob-3",
    },
  ];

  for (const reaction of reactions) {
    await prisma.reaction.upsert({
      where: { id: reaction.id },
      update: {},
      create: reaction,
    });
  }

  console.log("✓ reactions seeded");

  const firstStepBadge = await prisma.badge.findUnique({ where: { name: "First Step" } });
  if (firstStepBadge) {
    for (const userId of [alice.id, bob.id]) {
      await prisma.userBadge.upsert({
        where: { userId_badgeId: { userId, badgeId: firstStepBadge.id } },
        update: {},
        create: { userId, badgeId: firstStepBadge.id },
      });
    }
  }

  console.log("✓ badges awarded to alice, bob");
  console.log("✓ dev seed complete");
}
