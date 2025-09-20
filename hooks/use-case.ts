import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CaseService } from '@/services/case-service';
import { Case, CaseStep } from '@/types/case';

export function useCreateCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      console.log('useCreateCase: Starting mutation');
      const result = await CaseService.createCase();
      console.log('useCreateCase: Mutation result:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('useCreateCase: Success callback with data:', data);
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
    onError: (error) => {
      console.error('useCreateCase: Error callback:', error);
    },
  });
}

export function useCase(caseId: string | null) {
  return useQuery({
    queryKey: ['case', caseId],
    queryFn: () => CaseService.getCase(caseId!),
    enabled: !!caseId,
    refetchInterval: (query) => {
      // Refetch every 2 seconds if case is in processing states
      const processingSteps: CaseStep[] = ['processing', 'analysis', 'timeline_analysis'];
      const data = query.state.data as Case | undefined;
      return data?.step && processingSteps.includes(data.step) ? 2000 : false;
    },
  });
}

export function useUploadVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ caseId, file }: { caseId: string; file: File }) => {
      console.log('useUploadVideo: Starting with caseId:', caseId, 'file:', file?.name);
      if (!caseId) {
        throw new Error('Case ID is required for video upload');
      }
      const result = await CaseService.uploadVideo(caseId, file);
      console.log('useUploadVideo: Upload complete');
      return result;
    },
    onSuccess: (_, { caseId }) => {
      console.log('useUploadVideo: Success callback for caseId:', caseId);
      queryClient.invalidateQueries({ queryKey: ['case', caseId] });
    },
    onError: (error) => {
      console.error('useUploadVideo: Error callback:', error);
    },
  });
}

export function useStartAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (caseId: string) => {
      console.log('useStartAnalysis: Starting analysis for caseId:', caseId);
      if (!caseId) {
        throw new Error('Case ID is required for analysis');
      }
      const result = await CaseService.startAnalysis(caseId);
      console.log('useStartAnalysis: Analysis started');
      return result;
    },
    onSuccess: (_, caseId) => {
      console.log('useStartAnalysis: Success callback for caseId:', caseId);
      queryClient.invalidateQueries({ queryKey: ['case', caseId] });
    },
    onError: (error) => {
      console.error('useStartAnalysis: Error callback:', error);
    },
  });
}

export function useUploadPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ caseId, file, type }: { caseId: string; file: File; type: 'user' | 'other' }) =>
      CaseService.uploadPhoto(caseId, file, type),
    onSuccess: (_, { caseId }) => {
      queryClient.invalidateQueries({ queryKey: ['case', caseId] });
    },
  });
}

export function useGenerateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CaseService.generateDocument,
    onSuccess: (_, caseId) => {
      queryClient.invalidateQueries({ queryKey: ['case', caseId] });
    },
  });
}

export function useGenerateMeme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CaseService.generateMeme,
    onSuccess: (_, caseId) => {
      queryClient.invalidateQueries({ queryKey: ['case', caseId] });
    },
  });
}
