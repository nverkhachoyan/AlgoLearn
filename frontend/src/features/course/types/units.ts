import { BaseModel } from "@/src/types";
import { Module } from "@/src/features/module/types";

export interface Unit extends BaseModel {
  unitNumber: number;
  name: string;
  description: string;
  modules: Module[];
  folderObjectKey: string;
  imgKey: string;
  mediaExt: string;
}
