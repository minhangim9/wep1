'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, TrendingUp, Clock } from 'lucide-react';

interface QuickSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_KEYWORDS = ['1+1 시카 앰플', '톤업 선크림', '글래스 수분크림', '세미매트 쿠션', '쥬시 틴트', '약산성 클렌저', '비건'];

export const QuickSearch: React.FC<QuickSearchProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      const saved = localStorage.getItem('dasseoba_recent_searches');
      if (saved) setRecentSearches(JSON.parse(saved));
    }
  }, [isOpen]);

  const handleSearch = (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter((k) => k !== term)].slice(0, 6);
    setRecentSearches(updated);
    localStorage.setItem('dasseoba_recent_searches', JSON.stringify(updated));
    onClose();
    router.push(`/category/all?search=${encodeURIComponent(term.trim())}`);
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('dasseoba_recent_searches');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-start animate-in fade-in duration-200">
      <div className="bg-white border-b border-neutral-200 shadow-2xl py-8 px-4 w-full">
        <div className="max-w-3xl mx-auto">
          {/* 닫기 버튼 */}
          <div className="flex justify-end mb-2">
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-800 p-1 rounded-full transition-colors flex items-center gap-1 text-xs"
            >
              <span>닫기</span>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 검색창 폼 */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(keyword);
            }}
            className="relative flex items-center border-b-2 border-neutral-900 pb-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="피부 고민, 상품명, 성분을 검색해보세요 (예: 1+1 앰플, 시카, 선크림)"
              className="w-full text-lg md:text-xl font-medium placeholder:text-neutral-400 focus:outline-hidden bg-transparent pr-12 text-neutral-900"
            />
            <button
              type="submit"
              className="absolute right-0 p-2 text-neutral-900 hover:text-rose-600 transition-colors"
              aria-label="검색"
            >
              <Search className="w-6 h-6" />
            </button>
          </form>

          {/* 최근 검색어 & 인기 검색어 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* 최근 검색어 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> 최근 검색어
                </span>
                {recentSearches.length > 0 && (
                  <button
                    onClick={clearRecent}
                    className="text-[11px] text-neutral-400 hover:text-neutral-700"
                  >
                    전체삭제
                  </button>
                )}
              </div>
              {recentSearches.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {recentSearches.map((term, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearch(term)}
                      className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs px-3 py-1.5 rounded-full transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-neutral-400 py-2">최근 검색 기록이 없습니다.</p>
              )}
            </div>

            {/* 실시간 인기 검색어 */}
            <div>
              <span className="text-xs font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1 mb-2">
                <TrendingUp className="w-3.5 h-3.5" /> 실시간 뷰티 핫 키워드
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_KEYWORDS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearch(item)}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs px-3 py-1.5 rounded-full font-medium transition-colors border border-rose-100"
                  >
                    #{item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 배경 클릭 시 닫기 */}
      <div className="flex-1" onClick={onClose}></div>
    </div>
  );
};
