'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useShop } from '@/context/ShopContext';
import {
  Bot,
  X,
  Send,
  Sparkles,
  MessageCircle,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';

export const ChatbotModal: React.FC = () => {
  const { isChatOpen, setIsChatOpen, chatMessages, sendChatMessage, addToCart } = useShop();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  if (!isChatOpen) return null;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col h-[560px] animate-in slide-in-from-bottom-5 duration-250">
      {/* 챗봇 헤더 */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 text-white p-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center border border-white/40">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm flex items-center gap-1.5">
              피우다(Piuda) AI 어드바이저
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </h3>
            <p className="text-[11px] text-rose-100">24시간 실시간 맞춤 화장품 상담</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <a
            href="https://pf.kakao.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 bg-[#FEE500] text-[#3C1E1E] rounded-full text-xs font-bold hover:scale-105 transition-transform"
            title="카카오톡 상담원 연결"
          >
            <MessageCircle className="w-4 h-4 fill-[#3C1E1E]" />
          </a>
          <button
            onClick={() => setIsChatOpen(false)}
            className="p-1.5 hover:bg-white/20 rounded-full text-white transition-colors"
            aria-label="챗봇 닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 대화 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-neutral-50/60">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-neutral-900 text-white rounded-br-xs'
                  : 'bg-white text-neutral-800 border border-neutral-200 shadow-xs rounded-bl-xs'
              }`}
            >
              <p>{msg.text}</p>

              {/* 추천 상품 카드 목록 */}
              {msg.productRecommendations && msg.productRecommendations.length > 0 && (
                <div className="mt-3 space-y-2 pt-2 border-t border-neutral-100">
                  <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> 추천 아이템
                  </p>
                  {msg.productRecommendations.map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-neutral-50 p-2 rounded-lg border border-neutral-200/80 flex items-center gap-2.5"
                    >
                      <img
                        src={prod.mainImage}
                        alt={prod.name}
                        className="w-12 h-12 object-cover rounded-md border border-neutral-200"
                      />
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/product/${prod.id}`}
                          onClick={() => setIsChatOpen(false)}
                          className="font-bold text-[11px] text-neutral-900 truncate block hover:text-rose-600"
                        >
                          {prod.name}
                        </Link>
                        <p className="text-rose-600 font-bold text-xs mt-0.5">
                          {prod.price.toLocaleString()}원
                          {prod.isOnePlusOne && (
                            <span className="ml-1 bg-rose-100 text-rose-700 text-[9px] px-1 py-0.2 rounded font-bold">
                              1+1
                            </span>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => addToCart(prod)}
                        className="p-1.5 bg-neutral-900 text-white rounded hover:bg-rose-600 transition-colors"
                        title="장바구니 담기"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 퀵 리플라이 버튼들 */}
            {msg.quickReplies && (
              <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                {msg.quickReplies.map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (reply.includes('카카오톡')) {
                        window.open('https://pf.kakao.com', '_blank');
                      } else {
                        sendChatMessage(reply);
                      }
                    }}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-medium px-2.5 py-1 rounded-full border border-rose-200 transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            <span className="text-[10px] text-neutral-400 mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 폼 */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-neutral-200 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="화장품 추천, 1+1 행사, 배송 질문..."
          className="flex-1 bg-neutral-100 text-neutral-900 text-xs px-3.5 py-2.5 rounded-full focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:bg-white border border-transparent focus:border-rose-400 transition-all"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 bg-neutral-900 text-white rounded-full hover:bg-rose-600 disabled:opacity-40 disabled:hover:bg-neutral-900 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
