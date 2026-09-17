/**
 * Prisma 7 generates model row types suffixed with `Model`. Re-export them
 * under their plain names from one app-level path so components never reach
 * into the generated client directory.
 */
import type {
  CertificateModel,
  EducationModel,
  ExperienceModel,
  MessageModel,
  PostModel,
  ProfileModel,
  ProjectModel,
  ServiceModel,
  SkillCategoryModel,
  SkillModel,
  TestimonialModel,
  UserModel,
} from "@/generated/prisma/models";

export type Certificate = CertificateModel;
export type Education = EducationModel;
export type Experience = ExperienceModel;
export type Message = MessageModel;
export type Post = PostModel;
export type Profile = ProfileModel;
export type Project = ProjectModel;
export type Service = ServiceModel;
export type Skill = SkillModel;
export type SkillCategory = SkillCategoryModel;
export type Testimonial = TestimonialModel;
export type User = UserModel;

export type SkillCategoryWithSkills = SkillCategory & { skills: Skill[] };
