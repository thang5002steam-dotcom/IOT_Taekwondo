import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { MobileUploadFile } from "@/infrastructure/http/http.types";

import type {
  PersonCreateRequest,
  PersonSearchParams,
  PersonUpdateRequest,
} from "../api/person.dto";
import { personApi } from "../api/personApi";
import type { UserPersonListParams } from "../api/user-person.dto";
import { userPersonApi } from "../api/userPersonApi";

export const PERSON_ADMIN_PAGE_SIZE = 200;

export const personKeys = {
  all: ["people"] as const,
  lists: () => [...personKeys.all, "list"] as const,
  list: (params?: PersonSearchParams) =>
    [...personKeys.lists(), params ?? { size: PERSON_ADMIN_PAGE_SIZE }] as const,
  details: () => [...personKeys.all, "details"] as const,
  detail: (id: string) => [...personKeys.details(), id] as const,
  faceImageUrl: (id: string) => [...personKeys.all, "face-image-url", id] as const,
  userPersons: (params?: UserPersonListParams) =>
    [...personKeys.all, "user-persons", params] as const,
};

export function usePeople(params?: PersonSearchParams) {
  const queryParams = params ?? { size: PERSON_ADMIN_PAGE_SIZE, sort: "fullName,asc" };
  return useQuery({
    queryKey: personKeys.list(queryParams),
    queryFn: () => personApi.list(queryParams),
    staleTime: 30_000,
  });
}

export function useStudents(params?: Omit<PersonSearchParams, "isStudent">) {
  const queryParams: PersonSearchParams = {
    isStudent: true,
    size: PERSON_ADMIN_PAGE_SIZE,
    sort: "fullName,asc",
    ...params,
  };
  return useQuery({
    queryKey: personKeys.list(queryParams),
    queryFn: () => personApi.list(queryParams),
    staleTime: 30_000,
  });
}

export function useCoaches(params?: Omit<PersonSearchParams, "isStudent">) {
  const queryParams: PersonSearchParams = {
    isStudent: false,
    size: PERSON_ADMIN_PAGE_SIZE,
    sort: "fullName,asc",
    ...params,
  };
  return useQuery({
    queryKey: personKeys.list(queryParams),
    queryFn: () => personApi.list(queryParams),
    staleTime: 30_000,
  });
}

export function usePeopleByPosition(positionId?: string) {
  return useQuery({
    queryKey: personKeys.list({
      positionId,
      size: PERSON_ADMIN_PAGE_SIZE,
      sort: "fullName,asc",
    }),
    queryFn: () =>
      personApi.list({
        positionId,
        size: PERSON_ADMIN_PAGE_SIZE,
        sort: "fullName,asc",
      }),
    enabled: Boolean(positionId),
    staleTime: 30_000,
  });
}

export function usePerson(personId?: string) {
  return useQuery({
    queryKey: personKeys.detail(personId ?? ""),
    queryFn: () => personApi.get(personId!),
    enabled: Boolean(personId),
    staleTime: 30_000,
  });
}

export function useUserPersons(params?: UserPersonListParams) {
  return useQuery({
    queryKey: personKeys.userPersons(params),
    queryFn: () =>
      userPersonApi.list({
        size: PERSON_ADMIN_PAGE_SIZE,
        sort: "createdAt,desc",
        ...params,
      }),
    enabled: Boolean(params?.personId),
    staleTime: 30_000,
  });
}

export function usePersonFaceImageUrl(personId?: string) {
  return useQuery({
    queryKey: personKeys.faceImageUrl(personId ?? ""),
    queryFn: () => personApi.getFaceImageUrl(personId!),
    enabled: Boolean(personId),
    staleTime: 60_000,
  });
}

export function useCreatePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: PersonCreateRequest) => personApi.create(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personKeys.lists() });
    },
  });
}

export function useUpdatePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      personId,
      request,
    }: {
      personId: string;
      request: PersonUpdateRequest;
    }) => personApi.update(personId, request),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: personKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: personKeys.detail(variables.personId),
      });
    },
  });
}

export function useDeletePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ personId, signal }: { personId: string; signal?: AbortSignal }) => personApi.delete(personId, signal),
    onSuccess: (_data, { personId }) => {
      queryClient.invalidateQueries({ queryKey: personKeys.lists() });
      queryClient.removeQueries({ queryKey: personKeys.detail(personId) });
    },
  });
}

export function useIdentifyPerson() {
  return useMutation({
    mutationFn: ({
      file,
      personCode,
    }: {
      file?: MobileUploadFile;
      personCode?: string;
    }) => personApi.identify(file, personCode),
  });
}

export function useUpdatePersonFaceEmbedding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      personId,
      file,
    }: {
      personId: string;
      file: MobileUploadFile;
    }) => personApi.updateFaceEmbedding(personId, file),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: personKeys.detail(variables.personId),
      });
      queryClient.invalidateQueries({
        queryKey: personKeys.faceImageUrl(variables.personId),
      });
    },
  });
}

export function useDeletePersonFaceEmbedding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (personId: string) => personApi.deleteFaceEmbedding(personId),
    onSuccess: (_data, personId) => {
      queryClient.invalidateQueries({
        queryKey: personKeys.detail(personId),
      });
      queryClient.invalidateQueries({
        queryKey: personKeys.faceImageUrl(personId),
      });
    },
  });
}
