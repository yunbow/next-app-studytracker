import { describe, it, expect } from "vitest";
import {
  CreateStudySessionSchema,
  UpdateStudySessionSchema,
  CreateGoalSchema,
  UpdateGoalSchema,
  CreateCommentSchema,
  CreateReactionSchema,
} from "@/features/study/schema/study-schema";

describe("CreateStudySessionSchema", () => {
  it("should validate valid study session data", () => {
    const data = {
      startTime: new Date().toISOString(),
      subject: "Math",
      description: "Algebra practice",
      visibility: "private" as const,
    };
    expect(() => CreateStudySessionSchema.parse(data)).not.toThrow();
  });

  it("should reject subject over 100 characters", () => {
    const data = {
      startTime: new Date().toISOString(),
      subject: "a".repeat(101),
    };
    expect(() => CreateStudySessionSchema.parse(data)).toThrow();
  });

  it("should reject description over 1000 characters", () => {
    const data = {
      startTime: new Date().toISOString(),
      description: "a".repeat(1001),
    };
    expect(() => CreateStudySessionSchema.parse(data)).toThrow();
  });

  it("should validate visibility enum", () => {
    const data = {
      startTime: new Date().toISOString(),
      visibility: "invalid",
    };
    expect(() => CreateStudySessionSchema.parse(data)).toThrow();
  });

  it("should default visibility to private", () => {
    const data = { startTime: new Date().toISOString() };
    const result = CreateStudySessionSchema.parse(data);
    expect(result.visibility).toBe("private");
  });
});

describe("UpdateStudySessionSchema", () => {
  it("should validate valid update data", () => {
    const data = {
      id: "clxyz123456789",
      subject: "Physics",
      visibility: "public" as const,
    };
    expect(() => UpdateStudySessionSchema.parse(data)).not.toThrow();
  });

  it("should validate visibility enum", () => {
    const data = { id: "clxyz123456789", visibility: "invalid" };
    expect(() => UpdateStudySessionSchema.parse(data)).toThrow();
  });
});

describe("CreateGoalSchema", () => {
  it("should validate valid goal data", () => {
    const data = {
      title: "Study 100 hours",
      description: "Complete math course",
      targetHours: 100,
    };
    expect(() => CreateGoalSchema.parse(data)).not.toThrow();
  });

  it("should reject empty title", () => {
    const data = { title: "" };
    expect(() => CreateGoalSchema.parse(data)).toThrow();
  });

  it("should reject title over 200 characters", () => {
    const data = { title: "a".repeat(201) };
    expect(() => CreateGoalSchema.parse(data)).toThrow();
  });

  it("should reject description over 1000 characters", () => {
    const data = {
      title: "Goal",
      description: "a".repeat(1001),
    };
    expect(() => CreateGoalSchema.parse(data)).toThrow();
  });

  it("should reject targetHours below 1", () => {
    const data = { title: "Goal", targetHours: 0 };
    expect(() => CreateGoalSchema.parse(data)).toThrow();
  });

  it("should reject targetHours above 10000", () => {
    const data = { title: "Goal", targetHours: 10001 };
    expect(() => CreateGoalSchema.parse(data)).toThrow();
  });
});

describe("UpdateGoalSchema", () => {
  it("should validate valid update data", () => {
    const data = {
      id: "clxyz123456789",
      title: "Updated Goal",
      status: "completed" as const,
    };
    expect(() => UpdateGoalSchema.parse(data)).not.toThrow();
  });

  it("should validate status enum", () => {
    const data = { id: "clxyz123456789", status: "invalid" };
    expect(() => UpdateGoalSchema.parse(data)).toThrow();
  });

  it("should validate all valid statuses", () => {
    const statuses = ["active", "completed", "archived"];
    statuses.forEach((status) => {
      const data = { id: "clxyz123456789", status };
      expect(() => UpdateGoalSchema.parse(data)).not.toThrow();
    });
  });
});

describe("CreateCommentSchema", () => {
  it("should validate valid comment data", () => {
    const data = {
      sessionId: "clxyz123456789",
      content: "Great study session!",
    };
    expect(() => CreateCommentSchema.parse(data)).not.toThrow();
  });

  it("should reject empty content", () => {
    const data = { sessionId: "clxyz123456789", content: "" };
    expect(() => CreateCommentSchema.parse(data)).toThrow();
  });

  it("should reject content over 500 characters", () => {
    const data = {
      sessionId: "clxyz123456789",
      content: "a".repeat(501),
    };
    expect(() => CreateCommentSchema.parse(data)).toThrow();
  });
});

describe("CreateReactionSchema", () => {
  it("should validate valid reaction data", () => {
    const data = {
      sessionId: "clxyz123456789",
      type: "heart" as const,
    };
    expect(() => CreateReactionSchema.parse(data)).not.toThrow();
  });

  it("should validate reaction type enum", () => {
    const data = { sessionId: "clxyz123456789", type: "invalid" };
    expect(() => CreateReactionSchema.parse(data)).toThrow();
  });

  it("should accept all valid reaction types", () => {
    const types = ["like", "heart", "clap", "fire"];
    types.forEach((type) => {
      const data = { sessionId: "clxyz123456789", type };
      expect(() => CreateReactionSchema.parse(data)).not.toThrow();
    });
  });
});
